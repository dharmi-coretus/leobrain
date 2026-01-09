const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();
const { createCompanyFlow } = require('../helpers/createCompanyFlow');

function generateRandomString(min = 3, max = 100) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function generateRandomPositiveNumber(min = 1, max = 20) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFutureDate(maxDays = 90) {
  const today = new Date();
  const randomOffset = Math.floor(Math.random() * maxDays) + 1; // 1–90 days
  const randomDate = new Date(today);
  randomDate.setDate(today.getDate() + randomOffset);
  return randomDate.toISOString().split('T')[0]; // YYYY-MM-DD
}
async function selectRandomCompany(page) {
  // Ensure page is alive
  await page.waitForLoadState('domcontentloaded');

  const companyDropdown = page
    .locator('label:has-text("Company Name")')
    .locator('xpath=following-sibling::button[@role="combobox"]');

  await expect(companyDropdown).toBeVisible({ timeout: 10000 });

  // Force-click avoids overlay interception (Radix UI issue)
  await companyDropdown.click({ force: true });

  const companyListbox = page.locator('[role="listbox"]');
  await expect(companyListbox).toBeVisible({ timeout: 10000 });

  const companyOptions = companyListbox.locator('[role="option"], button');
  const companyOptionCount = await companyOptions.count();

  if (companyOptionCount <= 1) {
    return false; // only "Create Company"
  }

  const randomCompanyIndex = Math.floor(Math.random() * (companyOptionCount - 1));
  const selectedCompany = (await companyOptions.nth(randomCompanyIndex).innerText()).trim();

  await companyOptions.nth(randomCompanyIndex).click({ force: true });
  console.log(`✅ Random company selected: ${selectedCompany}`);

  return true;
}

// Generate random string of given length
function randomString(minLen, maxLen) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  const length = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}


test('Edit Job from Draft', async ({ page }) => {

  // Step 1: Sign in
  await signIn(page);

  // Navigate to Jobs
  await page.locator('button:has-text("Jobs")').click();

  // Select Draft tab
  await page.locator('button:has-text("Draft")').click();
// ================= CLICK EDIT FROM FIRST CARD ================= //

// 1️⃣ Locate the FIRST card
const firstCard = page
  .locator('div.cursor-pointer')
  .filter({ has: page.locator('button[aria-haspopup="menu"]') })
  .first();

await firstCard.waitFor({ state: 'visible', timeout: 15000 });
await firstCard.scrollIntoViewIfNeeded();
console.log("📦 First card located");

// 2️⃣ Click the 3-dot menu button inside the first card
const threeDotMenu = firstCard.locator('button[aria-haspopup="menu"]');
await threeDotMenu.waitFor({ state: 'visible', timeout: 5000 });
await threeDotMenu.click();
console.log("⋮ Three-dot menu clicked");

// 3️⃣ Click the Edit option from dropdown
const editButton = page.getByRole('menuitem', { name: 'Edit' });
await editButton.waitFor({ state: 'visible', timeout: 5000 });
await editButton.click();
console.log("✏️ Edit option clicked successfully!");

// ================= CLICK JOB DETAIL STEPPER ================= //

const jobDetailStepper = page.getByRole('button', { name: /job detail/i });

await jobDetailStepper.waitFor({ state: 'visible', timeout: 10000 });
await jobDetailStepper.scrollIntoViewIfNeeded();
await jobDetailStepper.click();

console.log('📌 Job Detail stepper clicked');


// Job Title input locator (MUST be defined before use)
const jobTitleInput = page.locator('input[name="job_details.job_title"]');
await jobTitleInput.waitFor({ state: 'visible' });

// Generate random string (3–100 chars)
const randomJobTitle = generateRandomString();

// Fill and validate
await jobTitleInput.fill(randomJobTitle);
await expect(jobTitleInput).toHaveValue(randomJobTitle);

console.log(`✅ Job Title entered: ${randomJobTitle} (${randomJobTitle.length} chars)`);

   
// Step 6: Select Department randomly
const departmentDropdown = page.locator('button[role="combobox"]').first();
await departmentDropdown.waitFor({ state: 'visible' });
await departmentDropdown.click();

// Wait for dropdown options
const options = page.locator('[role="option"]');
await options.first().waitFor({ state: 'visible' });

const count = await options.count();

if (count === 0) {
  throw new Error('❌ No department options found');
}

// Select random option
const randomIndex = Math.floor(Math.random() * count);
const selectedText = (await options.nth(randomIndex).innerText()).trim();

await options.nth(randomIndex).click();

console.log(`✅ Random Department selected: "${selectedText}" (index ${randomIndex + 1})`);
await page.waitForTimeout(1000);

 // Step: Set number of openings dynamically (RANDOM positive number)
const openings = generateRandomPositiveNumber(1, 20);
console.log(`🧩 Random openings to set: ${openings}`);

const inputLocator = page.locator('input[name="job_details.openings"]');
await inputLocator.waitFor({ state: 'visible' });

const containerLocator = inputLocator.locator('..');

const minusButton = containerLocator.locator('button', {
  has: page.locator('path[d="M4.16602 10H15.8327"]'),
});

const plusButton = containerLocator.locator('button', {
  has: page.locator('path[d^="M14.9994 10.8307H"]'),
});

// Read current value
let currentValue = parseInt(await inputLocator.inputValue(), 10);

// Reset to minimum (1)
while (currentValue > 1) {
  await minusButton.click();
  currentValue = parseInt(await inputLocator.inputValue(), 10);
}

// Increase to random value
for (let i = 1; i < openings; i++) {
  await plusButton.click();
}

// Verify
await expect(inputLocator).toHaveValue(openings.toString());

console.log(`✅ Number of openings successfully set to: ${openings}`);

const workShiftDropdown = page.locator('button[role="combobox"]').nth(1);
await workShiftDropdown.waitFor({ state: 'visible' });
await workShiftDropdown.click();

const shiftOptions = page.locator('[role="option"]');
await shiftOptions.first().waitFor({ state: 'visible' });

const shiftCount = await shiftOptions.count();
if (shiftCount === 0) throw new Error('No Work Shift options found');

const randomWorkShiftIndex = Math.floor(Math.random() * shiftCount);
const selectedShift = (await shiftOptions.nth(randomWorkShiftIndex).innerText()).trim();

await shiftOptions.nth(randomWorkShiftIndex).click();

console.log(`✅ Random Work Shift selected: ${selectedShift}`);


await page.waitForTimeout(1000);

// --- Step: Select Work Place randomly ---
console.log('🌍 Selecting random Work Place...');

// Locate radio buttons
const workPlaceOptions = page.locator('[role="radio"]');
await workPlaceOptions.first().waitFor({ state: 'visible' });

const radioCount = await workPlaceOptions.count();
if (radioCount === 0) {
  throw new Error('❌ No Work Place radio buttons found');
}

// Pick random radio
const randomWorkPlaceIndex = Math.floor(Math.random() * radioCount);
const selectedOption = workPlaceOptions.nth(randomWorkPlaceIndex);

// Try to log label/value
const selectedValue =
  (await selectedOption.getAttribute('value')) ||
  (await selectedOption.innerText());

await selectedOption.click();

console.log(`✅ Random Work Place selected: ${selectedValue?.trim() || `index ${randomWorkPlaceIndex + 1}`}`);

await page.waitForTimeout(500);

console.log('📅 Selecting random expiry date via calendar UI...');

const dateInput = page.locator('#date');
await dateInput.waitFor({ state: 'visible' });

// Open calendar
await dateInput.click();

// Wait for calendar grid
const calendar = page.locator('[role="grid"]');
await calendar.waitFor({ state: 'visible' });

// Select only enabled future dates
const enabledDates = calendar.locator(
  '[role="gridcell"]:not([aria-disabled="true"])'
);

const enabledDateCount = await enabledDates.count();
if (enabledDateCount === 0) {
  throw new Error('❌ No selectable dates found');
}

// Pick random date
const randomDateIndex = Math.floor(Math.random() * enabledDateCount);
const selectedDate = enabledDates.nth(randomDateIndex);

// Capture text (for logs)
const selectedDateText = await selectedDate.innerText();

// Click date
await selectedDate.click();

console.log(`✅ Expiry date selected successfully: ${selectedDateText}`);

console.log('🏢 Selecting company (random or create new)...');

let companySelected = await selectRandomCompany(page);

if (!companySelected) {
  console.log('⚙️ No companies found — creating new company');

  // Click Create Company
  await page.getByRole('button', { name: /create company/i }).click();

  // 🟢 WAIT for create company flow to finish fully
  await createCompanyFlow(page);

  // 🟢 CRITICAL: wait for UI to stabilize
  await page.waitForLoadState('networkidle');

  // 🟢 Close any lingering overlay
  await page.keyboard.press('Escape').catch(() => {});

  console.log('🔁 Re-selecting company after creation...');

  companySelected = await selectRandomCompany(page);

  if (!companySelected) {
    throw new Error('❌ Company still not selectable after creation');
  }
}


await page.waitForTimeout(1000);

console.log("📍 Selecting Location...");

// 1️⃣ Get the dropdown button
const locationDropdownBtn = page.getByLabel("Location", { exact: true });
await locationDropdownBtn.waitFor({ state: "visible" });

// 2️⃣ Click to open dropdown
await locationDropdownBtn.click({ force: true });
await page.waitForTimeout(300);

// 3️⃣ Get all options
const locationOptions = page.locator('[role="option"]');
const totalOptions = await locationOptions.count();

if (totalOptions === 0) {
  throw new Error("❌ No location options found");
}

// 4️⃣ Pick a random index (use let to allow reassignment)
let randomLocationIndex = Math.floor(Math.random() * totalOptions);
const randomLocation = (await locationOptions.nth(randomLocationIndex).innerText()).trim();

console.log(`⚡ Randomly selecting Location: ${randomLocation}`);

// 5️⃣ Click the selected option
await locationOptions.nth(randomLocationIndex).click({ force: true });

// 6️⃣ Optional: wait briefly for UI to settle
await page.waitForTimeout(300);

console.log("✅ Location selected:", randomLocation);


console.log("📍 Selecting Experience...");

// 1️⃣ Target the Experience dropdown
const expDropdown = page.getByRole("combobox", { name: "Experience" });
await expDropdown.waitFor({ state: "visible" });

// 2️⃣ Click to open dropdown
await expDropdown.click({ force: true });
await page.waitForTimeout(300);

// 3️⃣ Get all dropdown options
const expOptions = page.getByRole("option");
const expCount = await expOptions.count();

if (expCount === 0) {
  throw new Error("❌ No Experience options found");
}

// 4️⃣ Pick a random option
const randomExpIndex = Math.floor(Math.random() * expCount);
const randomExp = (await expOptions.nth(randomExpIndex).innerText()).trim();

console.log(`⚡ Randomly selecting Experience: ${randomExp}`);

// 5️⃣ Click the selected option
await expOptions.nth(randomExpIndex).click({ force: true });

// 6️⃣ Optional wait for UI to stabilize
await page.waitForTimeout(300);

console.log("✅ Experience selected:", randomExp);



console.log("📍 Selecting Employment Type...");

// 1️⃣ Target the Employment Type dropdown
const empTypeDropdown = page.getByRole("combobox", { name: "Employment Type" });
await empTypeDropdown.waitFor({ state: "visible" });

// 2️⃣ Click to open the dropdown
await empTypeDropdown.click({ force: true });
await page.waitForTimeout(300);

// 3️⃣ Fetch all options
const empOptions = page.getByRole("option");
const totalEmpOptions = await empOptions.count();

if (totalEmpOptions === 0) {
  throw new Error("❌ No Employment Type options found");
}

// 4️⃣ Pick a random option
const randomIndexEmpType = Math.floor(Math.random() * totalEmpOptions);
const randomEmpType = (await empOptions.nth(randomIndexEmpType).innerText()).trim();

console.log(`⚡ Randomly selecting Employment Type: ${randomEmpType}`);

// 5️⃣ Click the selected option
await empOptions.nth(randomIndexEmpType).click({ force: true });

// 6️⃣ Optional: wait briefly for UI to settle
await page.waitForTimeout(300);

console.log("✅ Employment Type selected:", randomEmpType);

console.log("📍 Selecting Education...");

// Read ENV value
const envEducation = process.env.EDUCATION?.trim() || "";

// 1️⃣ Locate dropdown by label name
const educationDropdown = page.getByRole("combobox", { name: /Education/i });

// 2️⃣ Open dropdown
await educationDropdown.waitFor();
await educationDropdown.click();
await page.waitForTimeout(300);

// 3️⃣ Get all options
const eduOptions = page.getByRole("option");
const eduCount = await eduOptions.count();

let allEduValues = [];
for (let i = 0; i < eduCount; i++) {
  allEduValues.push(await eduOptions.nth(i).innerText());
}

console.log("📋 Education Options:", allEduValues);

// 4️⃣ Match ENV value or choose random
if (envEducation && allEduValues.includes(envEducation)) {
  console.log(`✅ Matched Education: ${envEducation}`);
  await page.getByRole("option", { name: envEducation }).click();
} else {
  const randomEdu = allEduValues[Math.floor(Math.random() * allEduValues.length)];
  console.log(`⚠️ No match → Selecting random: ${randomEdu}`);
  await page.getByRole("option", { name: randomEdu }).click();
}

await page.waitForTimeout(300);

  // await page.getByRole('combobox', { name: 'Additional Perks (Optional)' }).click();
  // await page.locator('div').filter({ hasText: /^Transport$/ }).click();
  // await page.getByText('Performance Bonuses').click();
  // await page.getByText('Overtime Pay').click();
  // await page.locator('html').click();

  // 📌 ADDITIONAL PERKS SELECTION BLOCK

console.log("🧹 Removing all selected perks...");

// 1️⃣ Locate the perks chip container
const selectedPerksContainer = page.locator('div.mt-2.flex.flex-wrap');

// Wait until container is visible (if perks exist)
if (await selectedPerksContainer.isVisible()) {

  // 2️⃣ Locate all cancel (❌) buttons inside chips
  let removeButtons = selectedPerksContainer.locator('button');

  let count = await removeButtons.count();
  console.log(`🔎 Found ${count} selected perks`);

  // 3️⃣ Remove perks one by one
  while (count > 0) {
    await removeButtons.first().scrollIntoViewIfNeeded();
    await removeButtons.first().click();

    console.log(`❌ Removed perk (${count})`);

    // Small wait for DOM to update
    await page.waitForTimeout(200);

    // Re-capture buttons after DOM update
    removeButtons = selectedPerksContainer.locator('button');
    count = await removeButtons.count();
  }

  console.log("✅ All selected perks removed");
} else {
  console.log("ℹ No selected perks found");
}


// 4. Close the dropdown (clicking away)
await page.locator('html').click();
console.log('  ✔ Closed Additional Perks Dropdown');

console.log("🚀 Selecting ALL perks in multi-select dropdown");

// 1️⃣ Open dropdown
const perksDropdownBtn = page.locator('button[role="combobox"]', { hasText: 'Select Perks' });
await perksDropdownBtn.click();

// 2️⃣ Wait for dropdown options container to appear
const dropdownContent = page.locator('div[data-radix-popper-content-wrapper]');
await dropdownContent.waitFor({ state: 'visible' });

// 3️⃣ Get all options inside dropdown
const perkOptions = dropdownContent.locator('div.flex.cursor-pointer'); // use actual class for options
const totalPerks = await perkOptions.count();
console.log(`🔎 Total perks found: ${totalPerks}`);

// 4️⃣ Loop through all and click
for (let i = 0; i < totalPerks; i++) {
    const perk = perkOptions.nth(i);
    const perkName = await perk.innerText();
    await perk.click();
    console.log(`✔ Selected perk: ${perkName}`);
    await page.waitForTimeout(100); // small delay to ensure UI updates
}

// 5️⃣ Close dropdown by clicking outside
await page.locator('html').click();
console.log("✅ All perks selected");


await page.getByRole('button', { name: 'Next' }).click();

await page.waitForTimeout(300);
// ------------------ HELPER FUNCTIONS ------------------ //

// Generate random string of length between min and max
function randomString(minLength, maxLength) {
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Select a random word in given TipTap editor index
async function selectRandomWordInEditor(page, editorIndex) {
  await page.evaluate((index) => {
    const editor = document.querySelectorAll('div.tiptap.ProseMirror[contenteditable="true"]')[index];
    if (!editor) return;

    const words = editor.innerText.trim().split(/\s+/);
    if (words.length === 0) return;

    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex];

    const range = document.createRange();
    const selection = window.getSelection();
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
      const txt = walker.currentNode.nodeValue;
      const pos = txt.indexOf(word);
      if (pos !== -1) {
        range.setStart(walker.currentNode, pos);
        range.setEnd(walker.currentNode, pos + word.length);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
    }
  }, editorIndex);
}

// Apply all formatting in given editor index
async function applyAllFormatting(page, editorIndex, startButtonIndex) {
  const formattingButtons = [
    startButtonIndex,     // Bold
    startButtonIndex + 1, // Italic
    startButtonIndex + 2, // Underline
    startButtonIndex + 3, // Bullet
    startButtonIndex + 4  // Numbering
  ];

  // Apply formatting to 3 random words (Bold, Italic, Underline)
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(500);
    await selectRandomWordInEditor(page, editorIndex);
    await page.locator('div.bg-sub-background button[data-slot="toggle"]').nth(formattingButtons[i]).click();
  }

  // Bullet and numbering
  await page.locator('div.bg-sub-background button[data-slot="toggle"]').nth(formattingButtons[3]).click();
  console.log("📌 Bullet points applied");
  await page.waitForTimeout(300);
  await page.locator('div.bg-sub-background button[data-slot="toggle"]').nth(formattingButtons[4]).click();
  console.log("📌 Number points applied");
  await page.waitForTimeout(500);
}

// ------------------ FUNCTION TO CLEAR AND EDIT EDITORS ------------------ //
async function clearAndEditEditor(page, editorIndex, startButtonIndex, minLength, maxLength) {
  const editor = page.locator('div.tiptap.ProseMirror[contenteditable="true"]').nth(editorIndex);
  await editor.waitFor({ state: 'visible' });
  await editor.click();

  // Clear existing content
  await editor.evaluate((el) => {
    el.innerHTML = '';
  });

  // Type new random text
  const randomText = randomString(minLength, maxLength);
  await editor.pressSequentially(randomText, { delay: 5 });
  console.log(`✍ Editor ${editorIndex} cleared & new text added`);

  // Apply formatting
  await applyAllFormatting(page, editorIndex, startButtonIndex);
}

// ------------------ EDIT EXISTING CONTENT ------------------ //

// Job Description Editor
await clearAndEditEditor(page, 0, 0, 50, 300);

// Responsibilities Editor
await clearAndEditEditor(page, 1, 5, 50, 300);

// Qualifications Editor
await clearAndEditEditor(page, 2, 10, 50, 300);

// ------------------ SKILLS SECTION ------------------ //

// Locate the skills input container
const skillsContainer = page.locator('div.flex.w-full.flex-wrap.gap-2.rounded-lg');

// 1️⃣ Remove all existing skills
const existingSkills = skillsContainer.locator('div.flex.items-center.gap-1');
const skillCount = await existingSkills.count();

if (skillCount > 0) {
  console.log(`🔄 Removing ${skillCount} existing skills...`);
  for (let i = 0; i < skillCount; i++) {
    // Always click the first skill's X button (they shift left after removal)
    await existingSkills.nth(0).locator('button').click();
    await page.waitForTimeout(200);
  }
  console.log("✅ All existing skills removed");
} else {
  console.log("⚠ No existing skills found");
}

// 2️⃣ Enter new random skills
const skillsInput = skillsContainer.locator('input[type="text"]');
const totalSkills = Math.floor(Math.random() * 10) + 1; // 1 to 10 random skills

console.log(`✍ Adding ${totalSkills} new random skills...`);
for (let i = 0; i < totalSkills; i++) {
  const skill = randomString(1, 100); // Using the same randomString function as before
  await skillsInput.fill(skill);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  console.log(`✔ Added skill: ${skill}`);
}

console.log("✅ Skills section updated with random skills");

console.log("✅ All prefilled editors updated with random content and formatting!");


const nextBtn = page.locator('button[type="submit"]', { hasText: "Next" });

await nextBtn.waitFor({ state: "visible" });
await nextBtn.click();

console.log("➡ Clicked Next");

console.log("💰 Selecting random Pay Structure...");

// 1️⃣ Open the dropdown
const payStructureDropdown = page.getByRole('combobox', { name: 'Pay Structure' });
await payStructureDropdown.click();
await page.waitForTimeout(500); // allow dropdown animation

// 2️⃣ Get all items
const payItems = page.locator('[data-slot="select-item"]');
const payList = await payItems.allInnerTexts();

if (payList.length === 0) {
  console.log('⚠ No pay structure options found.');
  return;
}

// 3️⃣ Pick a random value
const randomPayValue = payList[Math.floor(Math.random() * payList.length)];

// 4️⃣ Click the random option
await payItems.filter({ hasText: randomPayValue }).first().click();

console.log(`✔ Randomly selected Pay Structure: ${randomPayValue}`);

console.log("💸 Selecting random Pay Terms...");

// 1️⃣ Click the "Pay Terms" dropdown (2nd dropdown)
const payTermsDropdown = page.locator('button[role="combobox"]').nth(1);
await payTermsDropdown.click();
await page.waitForTimeout(500); // allow dropdown animation

// 2️⃣ Get all dropdown options
const payTermsOptions = page.locator('[data-slot="select-item"]');
const availableTerms = await payTermsOptions.allInnerTexts();

if (availableTerms.length === 0) {
  console.log('⚠ No Pay Terms options found.');
  return;
}

// 3️⃣ Pick a random option
const randomPayTerms = availableTerms[Math.floor(Math.random() * availableTerms.length)];

// 4️⃣ Click the random option
await payTermsOptions.filter({ hasText: randomPayTerms }).first().click();

console.log(`✔ Randomly selected Pay Terms: ${randomPayTerms}`);


console.log("💱 Selecting random Currency...");

// 1️⃣ Click the "Currency" dropdown (3rd combobox)
const currencyDropdown = page.locator('button[role="combobox"]').nth(2);
await currencyDropdown.click();
await page.waitForTimeout(500); // allow dropdown animation

// 2️⃣ Get all available currency options
const currencyOptions = page.locator('[data-slot="select-item"]');
const availableCurrencies = await currencyOptions.allInnerTexts();

if (availableCurrencies.length === 0) {
  console.log('⚠ No currency options found.');
  return;
}

// 3️⃣ Pick a random currency
const randomCurrency = availableCurrencies[Math.floor(Math.random() * availableCurrencies.length)];

// 4️⃣ Click the random currency
await currencyOptions.filter({ hasText: randomCurrency }).first().click();

console.log(`✔ Randomly selected Currency: ${randomCurrency}`);



console.log("💵 Selecting random Salary Type and filling values...");

// ======== SELECT RADIO BUTTON BASED ON RANDOM ========
const salaryTypeButtons = page.locator('div[role="radiogroup"] button[role="radio"]');

const availableTypes = await salaryTypeButtons.evaluateAll(btns =>
  btns.map(btn => btn.getAttribute('value'))
);

// 1️⃣ Pick a random salary type
const finalSalaryType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

await page.locator(`button[role="radio"][value="${finalSalaryType}"]`).click();
console.log(`✔ Random Salary Type Selected: ${finalSalaryType}`);

await page.waitForTimeout(500);

// ======== FILL FIELDS BASED ON SALARY TYPE ========

// Helper to generate random number in range
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ------------------ FIXED --------------------
if (finalSalaryType === "Fixed") {
  const amountInput = page.locator('input[name="amount"]');
  const randomAmount = getRandomInt(30000, 150000); // random fixed salary
  await amountInput.fill(randomAmount.toString());
  console.log(`✔ Fixed Salary Amount Entered: ${randomAmount}`);
}

// ------------------ RANGE --------------------
else if (finalSalaryType === "Range") {
  const minInput = page.locator('input[name="minimum"]');
  const maxInput = page.locator('input[name="maximum"]');

  const randomMin = getRandomInt(20000, 100000);
  const randomMax = getRandomInt(randomMin + 5000, randomMin + 100000); // max > min

  await minInput.fill(randomMin.toString());
  await page.waitForTimeout(200);
  await maxInput.fill(randomMax.toString());

  console.log(`✔ Range Salary Entered: Min=${randomMin}, Max=${randomMax}`);
}

// ------------------ UPTO --------------------
else if (finalSalaryType === "Upto") {
  const uptoInput = page.locator('input[name="amount"]');
  const randomUpto = getRandomInt(50000, 200000);
  await uptoInput.fill(randomUpto.toString());
  console.log(`✔ Upto Amount Entered: ${randomUpto}`);
}

// ------------------ FROM --------------------
else if (finalSalaryType === "From") {
  const fromInput = page.locator('input[name="amount"]');
  const randomFrom = getRandomInt(30000, 150000);
  await fromInput.fill(randomFrom.toString());
  console.log(`✔ From Amount Entered: ${randomFrom}`);
}


// --------------- Recruiter Name --------------------- //
// ----- RECRUITER SELECTION -----
// 1️⃣ Open the recruiter dropdown (4th combobox)
const recruiterDropdown = page.locator('button[role="combobox"]').nth(3);
await recruiterDropdown.click();
await page.waitForTimeout(500); // wait for dropdown animation

// 2️⃣ Locate all recruiter options inside the Radix viewport
const recruiterOptionsContainer = page.locator('div[data-radix-select-viewport]');
const recruiterOptions = recruiterOptionsContainer.locator('div[role="option"]');
const totalRecruiters = await recruiterOptions.count();

if (totalRecruiters === 0) {
  console.log("⚠ No recruiter options found.");
} else {
  // 3️⃣ Pick a random recruiter
  const randIdx = Math.floor(Math.random() * totalRecruiters);
  const randomName = await recruiterOptions.nth(randIdx).innerText();

  await recruiterOptions.nth(randIdx).click();
  console.log(`✔ Selected RANDOM recruiter: ${randomName}`);
}



console.log("📧 Filling random Recruiter Email...");

// Email input locator
const emailInput = page.locator('input[name="email"]');

// Wait to ensure auto-filled value appears
await page.waitForTimeout(1000);

// Helper function to generate random email
function generateRandomEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let username = '';
  for (let i = 0; i < 8; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const domains = ['example.com', 'testmail.com', 'mailinator.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${username}@${domain}`;
}

// Generate a random email
const randomEmail = generateRandomEmail();

// Clear any existing value and enter the random email
await emailInput.fill("");
await emailInput.fill(randomEmail);

console.log(`✔ Random email entered: ${randomEmail}`);

console.log("📱 Selecting random country code and phone number");

// 1️⃣ Open country selector dropdown
const countryDropdown = page.getByRole('combobox', { name: 'Country selector' });
await countryDropdown.click();
await page.waitForTimeout(500);

// 2️⃣ Get all country options (react-international-phone)
const countryOptions = page.locator('li[role="option"]');
const countryCount = await countryOptions.count();

if (countryCount === 0) {
  console.log("⚠ No country options found.");
  return;
}

// 3️⃣ Pick a RANDOM visible country
let randomCountryIndex;
let selectedCountryText;

for (let i = 0; i < countryCount; i++) {
  const option = countryOptions.nth(i);
  if (await option.isVisible()) {
    randomCountryIndex = i;
    selectedCountryText = await option.innerText();
    break;
  }
}

await countryOptions.nth(randomCountryIndex).click({ force: true });
console.log(`🌍 Selected Country: ${selectedCountryText}`);

// 4️⃣ Generate random phone number (7–15 digits)
const phoneLength = Math.floor(Math.random() * 9) + 7; // 7–15
let randomPhone = '';

for (let i = 0; i < phoneLength; i++) {
  randomPhone += Math.floor(Math.random() * 10);
}

// 5️⃣ Enter phone number
const phoneInput = page.locator('input[name="phone"]');
await phoneInput.fill('');
await phoneInput.type(randomPhone);

console.log(`📱 Phone Number Entered: ${randomPhone}`);


await page.waitForTimeout(1000); // pause for visibility

// 5️⃣ Click Next button after phone number entry
const nextButton = page.locator('button[type="submit"]', { hasText: 'Next' });

await nextButton.click();
console.log("➡️ Clicked Next button");

// Wait so user can see
await page.waitForTimeout(1500);

// Select all question cards
const allQuestionCards = await page.locator('div[draggable="true"]');
const totalCards = await allQuestionCards.count();

// Pick a random card index
const randomCardIndex = Math.floor(Math.random() * totalCards);
const randomCard = allQuestionCards.nth(randomCardIndex);

// Scroll into view and hover (optional but safer)
await randomCard.scrollIntoViewIfNeeded();
await randomCard.hover();

// Click the menu button inside the random card
const menuBtn = randomCard.locator('button[data-slot="dropdown-menu-trigger"]');
await menuBtn.click();

// Wait for the dropdown menu to appear and click "Edit"
const editBtn = page.locator('text=Edit'); // assumes the menu has visible text "Edit"
await editBtn.click();

console.log(`Clicked Edit on question card #${randomCardIndex + 1}`);

function generateRandomQuestion(min = 10, max = 250) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  let text = '';

  for (let i = 0; i < length; i++) {
    text += chars[Math.floor(Math.random() * chars.length)];
  }

  return text.trim();
}
function randomString(min = 10, max = 250) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
  const len = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('').trim();
}

function randomShortString(min = 1, max = 50) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const len = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const editDialog = page.getByRole('dialog');

await expect(editDialog).toBeVisible();
await expect(
  editDialog.getByRole('heading', { name: 'Edit Screening Question' })
).toBeVisible();
const questionInput = editDialog.locator('input[name="question"]');

await questionInput.waitFor({ state: 'visible' });
await questionInput.click();
await questionInput.fill('');

const newQuestion = generateRandomQuestion(); // 10–250 chars
await questionInput.type(newQuestion, { delay: 10 });

console.log(`✅ Updated question: ${newQuestion}`);


// ================= SELECT RANDOM QUESTION TYPE =================
// // IMPORTANT: locate AFTER dialog is visible
// const typeDropdown = editDialog.locator('button[role="combobox"]').first();

// await expect(typeDropdown).toBeVisible();
// await typeDropdown.click();

// // Radix renders options outside dialog → use page
// const typeOptions = page.locator('[role="option"]');
// await expect(typeOptions.first()).toBeVisible();

// const typeCount = await typeOptions.count();
// if (typeCount === 0) {
//   throw new Error('❌ No question types found');
// }

// const randomIdx = Math.floor(Math.random() * typeCount);
// const selectedType = (await typeOptions.nth(randomIdx).innerText()).trim();

// await typeOptions.nth(randomIdx).click();

// console.log(`🎯 Random Question Type Selected: ${selectedType}`);

const typeDropdown = editDialog.locator('button[role="combobox"]').first();

const currentType = (
  await typeDropdown.locator('[data-slot="select-value"]').innerText()
).trim();

console.log(`ℹ Current Question Type: ${currentType}`);
await typeDropdown.click();
const typeOptions = page.locator('[role="option"]');
await expect(typeOptions.first()).toBeVisible();

const totalTypes = await typeOptions.count();
let selectableIndexes = [];

for (let i = 0; i < totalTypes; i++) {
  const text = (await typeOptions.nth(i).innerText()).trim();
  if (text !== currentType) {
    selectableIndexes.push(i);
  }
}

if (selectableIndexes.length === 0) {
  throw new Error('❌ No alternative question types available');
}

const randomIndexnew =
  selectableIndexes[Math.floor(Math.random() * selectableIndexes.length)];

const newType = (await typeOptions.nth(randomIndexnew).innerText()).trim();
await typeOptions.nth(randomIndexnew).click();

console.log(`🎯 Question Type changed → ${newType}`);


async function editExistingOptions(page) {
  const dialog = page.getByRole('dialog');

  // All inputs inside dialog
  const allInputs = dialog.locator('input[data-slot="input"]');
  const total = await allInputs.count();

  console.log(`🔎 Total inputs found (including question): ${total}`);

  // ⛔ index 0 = Question input → skip it
  for (let i = 1; i < total; i++) {
    const input = allInputs.nth(i);

    const isReadonly = await input.getAttribute('readonly');

    if (isReadonly !== null) {
      console.log(`⏭ Skipped readonly option #${i}`);
      continue;
    }

    const text = randomShortString(1, 50);
    await input.fill(text);

    console.log(`✔ Edited option #${i}: ${text}`);
  }
}


const optionTypes = ['Single Select', 'Multiple Select', 'Dropdown'];
const noExtraTypes = ['Short Answer', 'Long Answer', 'Rating', 'Date Picker', 'Number'];
if (optionTypes.includes(newType)) {
  console.log(`✏ Editing existing options for type: ${newType}`);
  await editExistingOptions(page);


 


}
// ================= FILE UPLOAD → SELECT ALL FILE TYPES =================
else if (newType === 'File Upload') {
  console.log('📂 Selecting ALL File Types');

  // 1️⃣ Open File Type dropdown
  const fileTypeDropdownBtn = editDialog.getByRole('combobox', { name: /file type/i });
  await fileTypeDropdownBtn.waitFor({ state: 'visible' });
  await fileTypeDropdownBtn.click();

  // 2️⃣ Wait for dropdown content (Radix popper)
  const dropdownContent = page.locator('div[data-radix-popper-content-wrapper]');
  await dropdownContent.waitFor({ state: 'visible' });

  // 3️⃣ Locate ALL file type options (same pattern as perks)
  const fileTypeOptions = dropdownContent.locator('div.flex.cursor-pointer');
  const totalFileTypes = await fileTypeOptions.count();

  console.log(`🔎 Total file types found: ${totalFileTypes}`);

  if (totalFileTypes === 0) {
    console.log('⚠ No file types found');
    return;
  }

  // 4️⃣ Click ALL file type options
  for (let i = 0; i < totalFileTypes; i++) {
    const option = fileTypeOptions.nth(i);
    const optionText = (await option.innerText()).trim();

    await option.click();
    console.log(`✔ Selected file type: ${optionText}`);

    await page.waitForTimeout(100); // allow UI state update
  }

  // 5️⃣ Close dropdown
  await page.locator('html').click();
  console.log('✅ All file types selected');
}


// ================= TOGGLE MANDATORY =================
// ================= TOGGLE MANDATORY (RADIX SAFE) =================

// Locate the REAL clickable checkbox button
const mandatoryCheckbox = editDialog.getByRole('checkbox');

// Ensure it's visible
await expect(mandatoryCheckbox).toBeVisible();

// Read current state
const isChecked =
  (await mandatoryCheckbox.getAttribute('aria-checked')) === 'true';

// Toggle
await mandatoryCheckbox.click();

console.log(
  `🔁 Mandatory toggled: ${isChecked ? 'UNCHECKED' : 'CHECKED'}`
);


// ================= SAVE =================
await editDialog.getByRole('button', { name: /^save$/i }).click();
console.log('✅ Question updated successfully');

// ================= ADD NEW QUESTION =================
const addSection = page.locator('div.rounded-3xl', { hasText: 'Question' });
await expect(addSection).toBeVisible();

// ---- Add Question Text
const addQuestionInput = addSection.locator('input[name="question"]');
const newQuestionadd = generateRandomQuestion();

await addQuestionInput.fill('');
await addQuestionInput.type(newQuestionadd, { delay: 10 });

// ---- Select Random Type
const addTypeDropdown = addSection.locator('button[role="combobox"]');
await addTypeDropdown.click();

const addTypeOptions = page.locator('[role="option"]');
await expect(addTypeOptions.first()).toBeVisible();

const addTypeCount = await addTypeOptions.count();
const addTypeIndex = Math.floor(Math.random() * addTypeCount);
const addType = (await addTypeOptions.nth(addTypeIndex).innerText()).trim();

await addTypeOptions.nth(addTypeIndex).click();

// ---- Handle Additional Fields (ADD)
if (optionTypes.includes(addType)) {
  const optionInputs = addSection.locator('input[data-slot="input"]');
  const count = await optionInputs.count();

  for (let i = 1; i < count; i++) {
    await optionInputs.nth(i).fill(randomShortString());
  }
}

else if (addType === 'File Upload') {
  const fileTypeDropdown = addSection.getByRole('combobox', { name: /file type/i });
  await fileTypeDropdown.click();

  const dropdown = page.locator('div[data-radix-popper-content-wrapper]');
  await dropdown.waitFor({ state: 'visible' });

  const fileTypes = dropdown.locator('div.flex.cursor-pointer');
  const total = await fileTypes.count();

  for (let i = 0; i < total; i++) {
    await fileTypes.nth(i).click();
    await page.waitForTimeout(100);
  }

  await page.locator('html').click();
}

// ---- Toggle Mandatory
await addSection.getByRole('checkbox').click();

// ---- Add Question
await addSection.getByRole('button', { name: /add question/i }).click();

console.log(`🆕 Added Question: ${newQuestion}`);

// 1️⃣ Get all question cards
const questionCards = page.locator('div[draggable="true"]');
const totalCards2 = await questionCards.count();

if (totalCards2 === 0) {
  throw new Error('❌ No question cards found');
}

// 2️⃣ Pick random card
const randomIndex3 = Math.floor(Math.random() * totalCards2);
const randomCard2 = questionCards.nth(randomIndex3);

console.log(`🗑 Deleting question card #${randomIndex3 + 1}`);

// 3️⃣ Scroll & open menu
await randomCard2.scrollIntoViewIfNeeded();
await randomCard2.hover();

const menuBtn3 = randomCard2.locator(
  'button[data-slot="dropdown-menu-trigger"]'
);
await menuBtn3.click();

// 4️⃣ Click Delete from dropdown
const deleteBtn = page.getByRole('menuitem', { name: 'Delete' });
await deleteBtn.click();

// 5️⃣ Handle confirmation dialog
const confirmDialog = page.getByRole('dialog', {
  name: 'Delete Question',
});

await expect(confirmDialog).toBeVisible();

// 6️⃣ Click "Yes, Delete"
const yesDeleteBtn = confirmDialog.getByRole('button', {
  name: 'Yes, Delete',
});
await yesDeleteBtn.click();


console.log('✅ Question deleted successfully');

// Use template flow
const useTemplateBtn = page.locator(
  'button[data-slot="hover-card-trigger"]',
  { hasText: 'Use template' }
);

if (await useTemplateBtn.count() > 0) {
  await useTemplateBtn.first().scrollIntoViewIfNeeded();
  await useTemplateBtn.first().click();
  console.log('✅ "Use template" button clicked');
} else {
  console.log('ℹ️ "Use template" button not present — skipped');
}

console.log('📂 Selecting random Template from dropdown...');

// 1️⃣ Locate the Template dropdown (combobox)
const templateDropdown = page.getByRole('combobox');

// Ensure visible
await templateDropdown.waitFor({ state: 'visible' });

// 2️⃣ Open dropdown
await templateDropdown.click({ force: true });

// 3️⃣ Radix renders options OUTSIDE → use page
const templateOptions = page.locator('[role="option"]');
await templateOptions.first().waitFor({ state: 'visible' });

// 4️⃣ Count options
const optionCount = await templateOptions.count();
if (optionCount === 0) {
  console.log('⚠ No template options found');
  return;
}

// 5️⃣ Pick random option
const randomIndex5 = Math.floor(Math.random() * optionCount);
const selectedTemplate = (await templateOptions.nth(randomIndex5).innerText()).trim();

// 6️⃣ Click random option
await templateOptions.nth(randomIndex5).click({ force: true });

console.log(`✅ Random Template selected: ${selectedTemplate}`);

await page.waitForTimeout(2000);
  // 2️⃣ Wait for template dialog
  const templateDialog = page.getByRole('dialog');
  await expect(templateDialog).toBeVisible({ timeout: 30000 });

  // 3️⃣ Get all question checkboxes
  const questionCheckboxes = templateDialog.locator('div.mb-6 button[role="checkbox"]');
  const totalQuestions = await questionCheckboxes.count();
  console.log(`🧮 Total questions in template: ${totalQuestions}`);

  if (totalQuestions === 0) {
    console.log('⚠ No questions found in the template');
  } else {
    // 4️⃣ Loop through each checkbox and select if not checked
    for (let i = 0; i < totalQuestions; i++) {
      const checkbox = questionCheckboxes.nth(i);
      const isChecked = (await checkbox.getAttribute('aria-checked')) === 'true';

      if (!isChecked) {
        await checkbox.click({ force: true });
        console.log(`✔ Question ${i + 1} selected`);
      } else {
        console.log(`ℹ Question ${i + 1} already selected`);
      }
    }

    console.log('✅ All questions selected');
  }


const addBtn = templateDialog.getByRole('button', { name: /^add$/i });

await expect(addBtn).toBeEnabled({ timeout: 5000 });
await addBtn.click();
await page.waitForTimeout(3000);
console.log('✅ Selected questions added successfully');


// 👉 Click on NEXT button (Existing navigation step)
await page.getByRole("button", { name: /^next$/i }).click();
console.log("➡ NEXT button clicked successfully!");
await page.waitForTimeout(3000);

// 2️⃣ Get all stage cards
  const stageCards = page.locator('div.mb-5.flex.items-center.gap-3[draggable="true"]');
  const totalStages = await stageCards.count();

  if (totalStages === 0) {
    console.log('⚠ No stages found');
    return;
  }

  // 3️⃣ Pick a random stage
  const randomIndex6 = Math.floor(Math.random() * totalStages);
  const randomStage = stageCards.nth(randomIndex6);

  console.log(`🎲 Random stage selected: #${randomIndex6 + 1}`);

  // 4️⃣ Scroll into view (optional but safer)
  await randomStage.scrollIntoViewIfNeeded();

  // 5️⃣ Click the three-dot menu button inside this stage card
  const menuButton = randomStage.locator('button[aria-haspopup="menu"]');
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  console.log('⋮ Three-dot menu clicked');

  // 6️⃣ Wait for the menu to appear and click "Edit"
  const editButton3 = page.locator('div[role="menuitem"]', { hasText: 'Edit' });
  await expect(editButton3).toBeVisible();
  await editButton3.click();

  console.log('✏ Edit button clicked');

  // --- 1️⃣ Locate Stage Name input ---
  const nameInput = page.locator('input[name="name"]');
  await expect(nameInput).toBeVisible();

  // Clear existing value and fill random name (3-30 chars)
  await nameInput.fill('');
  const newName = randomString(3, 30);
  await nameInput.fill(newName);
  await nameInput.waitFor({ state: 'visible', timeout: 5000 });
  console.log(`✏ Stage name updated to: ${newName}`);

  // --- 2️⃣ Locate Stage Description input ---
  const descInput = page.locator('input[name="description"]');
  await expect(descInput).toBeVisible();

  // Clear existing value and fill random description (3-100 chars)
  await descInput.fill('');
  const newDesc = randomString(3, 100);
  await descInput.fill(newDesc);
  await descInput.waitFor({ state: 'visible', timeout: 5000 });
  console.log(`✏ Stage description updated to: ${newDesc}`);
// --- Randomly select stage type ---
const stageTypes = ['Interview', 'Assessment'];
const randomStageType = stageTypes[Math.floor(Math.random() * stageTypes.length)];
console.log(`🧩 Randomly selected stage type: ${randomStageType}`);

const stageTypeButton = page.locator(`button[role="radio"][value="${randomStageType}"]`);
await stageTypeButton.waitFor({ state: 'visible' });
await stageTypeButton.click();

// --------------------- SELECT STAGE TYPE ---------------------
  if (randomStageType === "interview") {
    const interviewBtn = page.locator('#Interview');
    await interviewBtn.waitFor({ state: 'visible', timeout: 5000 });
    if ((await interviewBtn.getAttribute('aria-checked')) !== 'true') {
      await interviewBtn.click();
    }
    console.log("✔ Interview selected");
  } else if (randomStageType.toLowerCase() === "assessment") {
    console.log("✔ Assessment selected");

    // 🎲 RANDOM MODERATOR
    const moderatorDDL = page.locator('label:has-text("Moderator")').locator('..').locator('button[role="combobox"]');
    await moderatorDDL.waitFor({ state: 'visible', timeout: 5000 });
    await moderatorDDL.click();
    await page.waitForTimeout(300);

    const moderatorOptions = page.locator('div[role="listbox"] >> div[role="option"]');
    const moderatorCount = await moderatorOptions.count();
    if (moderatorCount > 0) {
        const randomModeratorIndex = Math.floor(Math.random() * moderatorCount);
        const moderatorText = await moderatorOptions.nth(randomModeratorIndex).innerText();
        await moderatorOptions.nth(randomModeratorIndex).click({ force: true });
        console.log(`✔ Random Moderator Selected: ${moderatorText}`);
    } else {
        console.log("⚠ No moderator options found");
    }

    // 🎲 RANDOM ASSESSMENT
    const assessmentDDL = page.locator('label:has-text("Assessment")').locator('..').locator('button[role="combobox"]');
    await assessmentDDL.waitFor({ state: 'visible', timeout: 5000 });
    await assessmentDDL.click();
    await page.waitForTimeout(300);

    const assessmentOptions = page.locator('div[role="listbox"] >> div[role="option"]');
    const assessmentCount = await assessmentOptions.count();
    if (assessmentCount > 0) {
        const randomAssessmentIndex = Math.floor(Math.random() * assessmentCount);
        const assessmentText = await assessmentOptions.nth(randomAssessmentIndex).innerText();
        await assessmentOptions.nth(randomAssessmentIndex).click({ force: true });
        console.log(`✔ Random Assessment Selected: ${assessmentText}`);
    } else {
        console.log("⚠ No assessment options found");
    }
}

const editStageDialog = page.getByRole('dialog', { name: 'Edit Stage' });
await expect(editStageDialog).toBeVisible();
console.log('📦 Edit Stage dialog is open');

// --------------------- CLICK SAVE BUTTON ---------------------
const saveButtonstage = editStageDialog.getByRole('button', { name: /^save$/i });
await expect(saveButtonstage).toBeEnabled();
await saveButtonstage.click();
console.log('💾 Save button clicked');

// --------------------- WAIT FOR DIALOG TO CLOSE ---------------------
await expect(editStageDialog).toBeHidden({ timeout: 10000 });
// OR (even stronger)
// await editStageDialog.waitFor({ state: 'detached', timeout: 10000 });

console.log('✅ Edit Stage dialog closed successfully');

// --------------------- GET ALL STAGE CARDS ---------------------
const stageCardsdelete = page.locator('div[draggable="true"]');
const stageCount = await stageCardsdelete.count();

expect(stageCount).toBeGreaterThan(0);
console.log(`📦 Total stages found: ${stageCount}`);

// --------------------- PICK RANDOM STAGE ---------------------
const randomIndexdelete = Math.floor(Math.random() * stageCount);
const selectedStage = stageCardsdelete.nth(randomIndexdelete);

console.log(`🎯 Random stage index selected: ${randomIndex}`);

// --------------------- OPEN KEBAB MENU ---------------------
const menuButtondelete = selectedStage.locator('button[data-slot="dropdown-menu-trigger"]');

await expect(menuButtondelete).toBeVisible();
await menuButtondelete.click();

console.log('☰ Stage menu opened');

// --------------------- CLICK DELETE ---------------------
const deleteOption = page.getByRole('menuitem', { name: /^delete$/i });

await expect(deleteOption).toBeVisible();
await deleteOption.click();

console.log('🗑 Delete option clicked');

// --------------------- WAIT FOR DELETE CONFIRMATION DIALOG ---------------------
const deleteDialog = page.locator('div[role="dialog"]', {
  hasText: 'Delete Stages'
});

await expect(deleteDialog).toBeVisible();
console.log('⚠ Delete confirmation dialog appeared');

// --------------------- CLICK YES, DELETE ---------------------
const yesDeleteBtn2 = deleteDialog.getByRole('button', { name: 'Yes, Delete' });

await expect(yesDeleteBtn2).toBeVisible();
await yesDeleteBtn2.click();

console.log('🔥 Yes, Delete clicked');

// ================= ADD NEW STAGE =================

// 1️⃣ Click on ➕ Stage button
const addStageBtn = page.getByRole('button', { name: 'Stage' });
await expect(addStageBtn).toBeVisible();
await addStageBtn.click();
console.log('➕ Add Stage button clicked');

// 2️⃣ Wait for Add Stage dialog
const addStageDialog = page.getByRole('dialog');
await expect(addStageDialog).toBeVisible();
console.log('📦 Add Stage dialog opened');

// --------------------- STAGE NAME ---------------------
const stageNameInput = addStageDialog.locator('input[name="name"]');
await expect(stageNameInput).toBeVisible();

const stageName = randomString(3, 30);
await stageNameInput.fill(stageName);
console.log(`✏ Stage Name: ${stageName}`);

// --------------------- STAGE DESCRIPTION ---------------------
const stageDescInput = addStageDialog.locator('input[name="description"]');
await expect(stageDescInput).toBeVisible();

const stageDesc = randomString(3, 100);
await stageDescInput.fill(stageDesc);
console.log(`✏ Stage Description: ${stageDesc}`);

// --------------------- RANDOM STAGE TYPE ---------------------
const stageTypes2 = ['Interview', 'Assessment'];
const selectedStageType =
  stageTypes2[Math.floor(Math.random() * stageTypes2.length)];

console.log(`🎲 Selected Stage Type: ${selectedStageType}`);

const stageTypeRadio = addStageDialog.locator(
  `button[role="radio"][value="${selectedStageType}"]`
);

await stageTypeRadio.waitFor({ state: 'visible' });
await stageTypeRadio.click();

// --------------------- IF ASSESSMENT ---------------------
if (selectedStageType === 'Assessment') {
  console.log('🧪 Handling Assessment fields');

  // 🎲 RANDOM MODERATOR
  const moderatorDDL = addStageDialog
    .locator('label:has-text("Moderator")')
    .locator('..')
    .locator('button[role="combobox"]');

  await moderatorDDL.waitFor({ state: 'visible', timeout: 5000 });
  await moderatorDDL.click();

  const moderatorOptions = page.locator(
    'div[role="listbox"] div[role="option"]'
  );

  const moderatorCount = await moderatorOptions.count();
  if (moderatorCount > 0) {
    const modIndex = Math.floor(Math.random() * moderatorCount);
    const modText = await moderatorOptions.nth(modIndex).innerText();
    await moderatorOptions.nth(modIndex).click({ force: true });
    console.log(`✔ Moderator Selected: ${modText}`);
  } else {
    console.log('⚠ No Moderator options found');
  }

  // 🎲 RANDOM ASSESSMENT
  const assessmentDDL = addStageDialog
    .locator('label:has-text("Assessment")')
    .locator('..')
    .locator('button[role="combobox"]');

  await assessmentDDL.waitFor({ state: 'visible', timeout: 5000 });
  await assessmentDDL.click();

  const assessmentOptions = page.locator(
    'div[role="listbox"] div[role="option"]'
  );

  const assessmentCount = await assessmentOptions.count();
  if (assessmentCount > 0) {
    const assessIndex = Math.floor(Math.random() * assessmentCount);
    const assessText = await assessmentOptions.nth(assessIndex).innerText();
    await assessmentOptions.nth(assessIndex).click({ force: true });
    console.log(`✔ Assessment Selected: ${assessText}`);
  } else {
    console.log('⚠ No Assessment options found');
  }
}

// --------------------- CLICK ADD BUTTON ---------------------
const addButton = addStageDialog.getByRole('button', { name: /^add$/i });
await expect(addButton).toBeEnabled();
await addButton.click();
await page.waitForTimeout(2000);
console.log('➕ Add button clicked');

// --------------------- WAIT FOR DIALOG TO CLOSE ---------------------
await expect(addStageDialog).toBeHidden({ timeout: 10000 });
console.log('✅ Add Stage dialog closed successfully');

const saveAsTemplateBtn = page.getByRole('button', { name: /save as template/i });
await expect(saveAsTemplateBtn).toBeVisible();
await saveAsTemplateBtn.click();
console.log('💾 Save as Template button clicked');

// Locate hidden icon select
const iconSelect = page.locator('select[name="icon"]');
await expect(iconSelect).toBeAttached();

// Use UNIQUE variable names
const iconOptions = iconSelect.locator('option');
const iconOptionCount = await iconOptions.count();

if (iconOptionCount === 0) {
  throw new Error('❌ No icon options found');
}

// Pick random icon
const randomIconIndex = Math.floor(Math.random() * iconOptionCount);
const randomIconValue = await iconOptions
  .nth(randomIconIndex)
  .getAttribute('value');

// Select random icon
await iconSelect.selectOption(randomIconValue);

console.log(`🎨 Random icon selected: ${randomIconValue}`);

const templateNameInput = page.locator('input[name="name"]');

const nameLength = Math.floor(Math.random() * (30 - 3 + 1)) + 3;
const templateName = randomString(nameLength);

await templateNameInput.fill(templateName);

console.log(`📝 Template name entered: ${templateName}`);

// Locate Template Description input
const templateDescriptionInput = page.locator('input[name="description"]');

// Wait until visible
await expect(templateDescriptionInput).toBeVisible();

// Generate random description (3–100 chars)
const descriptionLength = Math.floor(Math.random() * (100 - 3 + 1)) + 3;
const randomDescription = randomString(descriptionLength);

// Clear & fill
await templateDescriptionInput.fill('');
await templateDescriptionInput.fill(randomDescription);

console.log(`📝 Random template description entered (${descriptionLength} chars)`);

// Locate Save button by role + name (most stable)
const saveTemplateBtn = page.getByRole('button', { name: /^save$/i });

// Ensure button is visible & enabled
await expect(saveTemplateBtn).toBeVisible();
await expect(saveTemplateBtn).toBeEnabled();

// Click Save
await saveTemplateBtn.click();
console.log('💾 Save Template button clicked');

const saveTemplateDialog = page.getByRole('dialog', { name: 'Save Template' });

await expect(saveTemplateDialog).toBeHidden({ timeout: 10000 });

console.log('✅ Save Template dialog closed');


      
// --- Click Save button ---
const saveButton = page.locator('button[data-slot="hover-card-trigger"]', { hasText: 'Save' });
await saveButton.waitFor({ state: 'visible' });
await saveButton.click();
console.log('✅ Save button clicked');



// --- Wait for confirmation popup and click Yes ---
const confirmationDialog = page.locator('div[role="dialog"]', { hasText: 'Save Job as Draft?' });
await confirmationDialog.waitFor({ state: 'visible', timeout: 5000 });

const yesButton = confirmationDialog.locator('button', { hasText: 'Yes' });
await yesButton.click();
console.log('✅ Clicked Yes on confirmation popup');

});
