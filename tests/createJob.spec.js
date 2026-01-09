// tests/createJob.spec.js
const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
const { createCompanyFlow } = require('../helpers/createCompanyFlow');

require('dotenv').config();
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


test('Go to Jobs menu and click Create Job', async ({ page }) => {
  // Step 1: Sign in
  await signIn(page);
  await page.waitForTimeout(1000); // wait before clicking

  // Step 2: Click "Jobs" menu
  const jobsMenuButton = page.locator('button:has-text("Jobs")');
  await jobsMenuButton.waitFor({ state: 'visible' });
  await jobsMenuButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // wait before clicking
  await jobsMenuButton.click();

  // Step 3: Click "Create Job" button
const createJobButton = page.locator('button.bg-primary:has-text("Create Job")');
await createJobButton.waitFor({ state: 'visible' });
await createJobButton.click();


// Job Title input locator (MUST be defined before use)
const jobTitleInput = page.locator('input[name="job_details.job_title"]');
await jobTitleInput.waitFor({ state: 'visible' });

// Generate random string (3–100 chars)
const randomJobTitle = generateRandomString();

// Fill and validate
await jobTitleInput.fill(randomJobTitle);
await expect(jobTitleInput).toHaveValue(randomJobTitle);

console.log(`✅ Job Title entered: ${randomJobTitle} (${randomJobTitle.length} chars)`);

// // Step 4: Validate Job Title field

//  const jobTitleInput = page.locator('input[name="job_details.job_title"]');
//  await jobTitleInput.waitFor({ state: 'visible' });


// // --- Validation 1: Required field ---
//  // await jobTitleInput.click();
//  // await jobTitleInput.fill('');
// // await page.keyboard.press('Enter');
// // await page.waitForTimeout(500);
// // await expect(page.getByText(/required/i)).toBeVisible();
// // console.log('✅ Required field validation works');


//  // --- Validation 2: Minimum 3 characters ---

//  await jobTitleInput.fill('QA');
//  await page.keyboard.press('Enter'); // press Enter to trigger validation
//  await page.waitForTimeout(500);

// const minLengthError = page.getByText(/at least 3/i);
//  await expect(minLengthError).toBeVisible();
//  console.log('✅ Validation: "Minimum 3 characters" message displayed');

//  // --- Validation 3: Maximum 100 characters ---
//  const longTitle = 'A'.repeat(101);
//  await jobTitleInput.fill(longTitle);
//  await page.keyboard.press('Enter'); // trigger validation
// // await page.waitForTimeout(500);

//  const maxLengthError = page.getByText(/exceed 100/i);
//  await expect(maxLengthError).toBeVisible();
//  console.log('✅ Validation: "Maximum 100 characters" message displayed');

//  // --- Now enter valid job title from env ---
// const jobTitle = process.env.JOB_TITLE;
// await jobTitleInput.fill(jobTitle);
//  await expect(jobTitleInput).toHaveValue(jobTitle);
// console.log(`✅ Job Title entered: ${jobTitle}`);

// //  /*// Step 4: Fill Job Title (from .env)
// //   const jobTitle = process.env.JOB_TITLE;
// //   const jobTitleInput = page.locator('input[name="job_details.job_title"]');
// //   await jobTitleInput.waitFor({ state: 'visible' });
// //   await jobTitleInput.click();
// //   await jobTitleInput.fill(jobTitle);
// //   await page.waitForTimeout(1000);

// //   // Step 5: Verify Job Title entered
// //   await expect(jobTitleInput).toHaveValue(jobTitle);
// // */

   // Optional page verification
 await expect(page).toHaveURL(/recruitment\/job-create\/details/);
   await expect(page.locator('h1')).toHaveText(/Create Job/i);
   
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

console.log("🔧 Selecting Additional Perks...");

// 1. Read and process the dynamic data from a fixed environment variable key
// We use a fixed key (e.g., ADDITIONAL_PERKS_LIST) since it's a standalone field.
const envKey = 'ADDITIONAL_PERKS_LIST';
const rawPerks = (process.env[envKey] || "")
  .split(",")
  .map(x => x.trim()) // Keep original case/spacing to match UI text exactly
  .filter(Boolean);

if (rawPerks.length === 0) {
  console.log(`⚠ No perks found in environment variable: ${envKey}. Skipping selection.`);
  return;
}

// 2. Open the main combobox dropdown
const ddlPerks = page.getByRole('combobox', { name: 'Additional Perks (Optional)' });
await ddlPerks.click();

// --- UI-SPECIFIC LOGIC (The Transport Category Click) ---
// This step is kept as it was in your original hardcoded script.
const transportCategory = page.locator('div').filter({ hasText: /^Transport$/ });

if (await transportCategory.isVisible()) {
  await transportCategory.click();
  console.log('  ✔ Clicked Category: Transport (to reveal options)');
}
// --------------------------------------------------------

// 3. Loop through the dynamic list and click each perk option
for (const perk of rawPerks) {
  const optionLocator = page.getByText(perk, { exact: true });

  if (await optionLocator.isVisible()) {
    await optionLocator.click(); 
    console.log(`  ✔ Selected Perk: ${perk}`);
  } else {
    console.log(`  ⚠ Perk option not visible/found: ${perk}.`);
  }
}

// 4. Close the dropdown (clicking away)
await page.locator('html').click();
console.log('  ✔ Closed Additional Perks Dropdown');

await page.getByRole('button', { name: 'Next' }).click();

await page.waitForTimeout(300);

// Locate the "Job Description" section
const jobDescriptionSection = page.locator('section:has(h3:text("Job Description"))');



// Select the first TipTap editor
const editor = page.locator('div.tiptap.ProseMirror[contenteditable="true"]').nth(0);

// Wait until visible
await editor.waitFor({ state: 'visible' });

// Click inside the editor
await editor.click();

// Type job description from .env
await editor.pressSequentially(process.env.JOB_DESCRIPTION, { delay: 10 });

// ------- FUNCTION: Select any random word inside editor ------- //
async function selectRandomWord(page) {
  await page.evaluate(() => {
    const editorEl = document.querySelector('div.tiptap.ProseMirror[contenteditable="true"]');
    if (!editorEl) return;

    const text = editorEl.innerText.trim().split(/\s+/);
    if (text.length === 0) return;

    const randomIndex = Math.floor(Math.random() * text.length);
    const selectedWord = text[randomIndex];

    const range = document.createRange();
    const selection = window.getSelection();

    function findAndSelectWord(node, word) {
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);

      while (walker.nextNode()) {
        const txt = walker.currentNode.nodeValue;
        const pos = txt.indexOf(word);

        if (pos !== -1) {
          range.setStart(walker.currentNode, pos);
          range.setEnd(walker.currentNode, pos + word.length);

          selection.removeAllRanges();
          selection.addRange(range);
          return true;
        }
      }
      return false;
    }

    findAndSelectWord(editorEl, selectedWord);
  });
}

// --------------------------------------------------------------- //
// 1️⃣ FIRST: Bold (your working code)
// --------------------------------------------------------------- //

await page.waitForTimeout(800);

// Select random word
await selectRandomWord(page);

// Click Bold (first formatting button)
const boldButton = page.locator(
  'div.bg-sub-background button[data-slot="toggle"]'
).nth(0);

await boldButton.waitFor({ state: "visible", timeout: 5000 });
await expect(boldButton).toBeEnabled();
await boldButton.click();
await page.waitForTimeout(300);

console.log("✅ Bold applied successfully");

// --------------------------------------------------------------- //
// 2️⃣ SECOND: Select NEW random word + click Italic
// --------------------------------------------------------------- //

await page.waitForTimeout(700);

// Select second random word
await selectRandomWord(page);

// Click Italic (second button)
const italicButton = page.locator(
  'div.bg-sub-background button[data-slot="toggle"]'
).nth(1);

await italicButton.waitFor({ state: "visible", timeout: 5000 });
await expect(italicButton).toBeEnabled();
await italicButton.click();
await page.waitForTimeout(300);

console.log("✨ Italic applied successfully");

await page.waitForTimeout(500);
await selectRandomWord(page);

const underlineButton = page.locator(
  'div.bg-sub-background button[data-slot="toggle"]'
).nth(2);

await underlineButton.waitFor({ state: "visible" });
await underlineButton.click();
console.log("🔻 Underline applied");

await page.waitForTimeout(500);

// Click bullet point button
await page.locator('button[data-slot="toggle"]').nth(3).click();

console.log("📌 Bullet points applied");

await page.waitForTimeout(1000);


// Click number point button
await page.locator('button[data-slot="toggle"]').nth(4).click();

console.log("📌 Number points applied");

await page.waitForTimeout(1000);

// ---------------- RESPONSIBILITIES EDITOR ---------------- //




const responsibilitiesEditor = page
  .locator('div.tiptap.ProseMirror[contenteditable="true"]')
  .nth(1);

// Type responsibilities text
await responsibilitiesEditor.waitFor({state:'visible'});
await responsibilitiesEditor.click();
await responsibilitiesEditor.pressSequentially(process.env.RESPONSIBILITIES, { delay: 20 });

console.log("✍ Responsibilities text added");

// -------- Select Random Word in Responsibilities Editor -------- //
async function selectRandomWordres(page) {
  await page.evaluate(() => {
    const editor = document.querySelectorAll('div.tiptap.ProseMirror[contenteditable="true"]')[1];
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
  });
}

// ---- Select Random Word + Apply Bold ---- //
await page.waitForTimeout(500);
await selectRandomWordres(page);

const boldresButton = page.locator('div.bg-sub-background button[data-slot="toggle"]').nth(5);
await boldresButton.click();
await page.waitForTimeout(1000);
console.log("🔥 Bold applied in Responsibilities field");


// ---- Select Random Word + Apply italic ---- //
await page.waitForTimeout(500);
await selectRandomWordres(page);

const italicresButton = page.locator('div.bg-sub-background button[data-slot="toggle"]').nth(6);
await italicresButton.click();
await page.waitForTimeout(1000);
console.log("🔥 italic applied in Responsibilities field");


// ---- Select Random Word + Apply underline ---- //
await page.waitForTimeout(500);
await selectRandomWordres(page);

const underlineresButton = page.locator('div.bg-sub-background button[data-slot="toggle"]').nth(7);
await underlineresButton.click();
await page.waitForTimeout(1000);
console.log("🔥 Underline applied in Responsibilities field");

// Click bullet point button
await page.locator('button[data-slot="toggle"]').nth(8).click();

console.log("📌 Bullet points applied");

await page.waitForTimeout(1000);


// Click number point button
await page.locator('button[data-slot="toggle"]').nth(9).click();

console.log("📌 Number points applied");

await page.waitForTimeout(1000);


// ============================
// QUALIFICATIONS FIELD
// ============================

// Select qualifications editor
const qualificationsEditor = page
  .locator('div.tiptap.ProseMirror[contenteditable="true"]')
  .nth(2);

// Type qualifications
await qualificationsEditor.waitFor({ state: 'visible' });
await qualificationsEditor.click();
//await qualificationsEditor.pressSequentially(process.env.QUALIFICATIONS, { delay: 20 });
await qualificationsEditor.pressSequentially(process.env.QUALIFICATIONS.replace(/\\n/g, '\n'), { delay: 20 });

console.log("✍ Qualifications text added");

// ============================
// FUNCTION: Select random word in QUALIFICATIONS
// ============================
async function selectRandomWordQual(page) {
  await page.evaluate(() => {
    const editor = document.querySelectorAll('div.tiptap.ProseMirror[contenteditable="true"]')[2];
    if (!editor) return;

    const words = editor.innerText.trim().split(/\s+/);
    if (!words.length) return;

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
  });
}

// ============================
// APPLY FORMATTING IN QUALIFICATIONS
// ============================

// Bold
await page.waitForTimeout(500);
await selectRandomWordQual(page);
await page.locator('div.bg-sub-background button[data-slot="toggle"]').nth(10).click();
await page.waitForTimeout(1000);
console.log("🔥 Bold applied in Qualifications");

// Italic
await page.waitForTimeout(500);
await selectRandomWordQual(page);
await page.locator('div.bg-sub-background button[data-slot="toggle"]').nth(11).click();
await page.waitForTimeout(1000);
console.log("🔥 Italic applied in Qualifications");

// Underline
await page.waitForTimeout(500);
await selectRandomWordQual(page);
await page.locator('div.bg-sub-background button[data-slot="toggle"]').nth(12).click();
await page.waitForTimeout(1000);
console.log("🔥 Underline applied in Qualifications");

// Bullet points
await page.locator('button[data-slot="toggle"]').nth(13).click();
await page.waitForTimeout(1000);
console.log("📌 Bullet points applied in Qualifications");


// Numbering
await page.locator('button[data-slot="toggle"]').nth(14).click();
await page.waitForTimeout(1000);
console.log("📌 Number points applied in Qualifications");


const skillsInput = page.locator('div.flex.w-full.flex-wrap.gap-2 input');



// Split skills from ENV file
const skills = process.env.SKILLS.split(',');

for (const skill of skills) {
  await skillsInput.fill(skill.trim());
  await page.keyboard.press("Enter");
  
  // ⏳ wait after adding skill
  await page.waitForTimeout(500);

  console.log(`✔ Added skill: ${skill}`);
}

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

// // Read env value
// const discloseSalaryEnv = process.env.DISCLOSE_SALARY === "true";

// // Locator
// const checkbox = page.locator('button#disclose_salary');

// // Wait until visible
// await checkbox.waitFor({ state: "visible" });

// // Check existing state
// const currentState = await checkbox.getAttribute("aria-checked") === "true";

// // Compare & toggle if needed
// if (discloseSalaryEnv !== currentState) {
//     await checkbox.click();
//     console.log(`Checkbox status changed to: ${discloseSalaryEnv ? "Checked" : "Unchecked"}`);
// } else {
//     console.log("Checkbox already in correct state.");
// }
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



// // ---------------------- 🟠 Enter Question ---------------------- //
// await page.locator('input[name="question"]').fill(process.env.QUESTION);
// console.log("✔ Question entered");
// await page.waitForTimeout(500);

// // ---------------------- 🟠 Select Question Type ---------------------- //
// const questionTypeEnv = process.env.QUESTION_TYPE.trim().toLowerCase();

// // Open dropdown
// const questionTypeDropdown = page.locator('button[role="combobox"]').nth(0);
// await questionTypeDropdown.click();
// await page.waitForTimeout(500);

// // Select matching type
// const typeOptions = page.locator('[role="option"]');
// const typeCount = await typeOptions.count();
// let typeSelected = false;

// for (let i = 0; i < typeCount; i++) {
//   const text = (await typeOptions.nth(i).innerText()).trim().toLowerCase();

//   if (text === questionTypeEnv) {
//     await typeOptions.nth(i).click();
//     console.log("✔ Selected Question Type:", text);
//     typeSelected = true;
//     break;
//   }
// }

// if (!typeSelected) {
//   console.log("⚠ No matching question type found. Selecting random.");
//   const randomIndex = Math.floor(Math.random() * typeCount);
//   await typeOptions.nth(randomIndex).click();
// }

// await page.waitForTimeout(700);

// // ---------------------- 🟠 Logic Based on Type ---------------------- //

// const typesWithOptions = ["single select", "multiple select", "drop down"];

// // ---------------------- 🔷 CASE: OPTION BASED TYPES ---------------------- //
// // if (typesWithOptions.includes(questionTypeEnv)) {
// //   console.log("📌 Adding options...");
  
// //   const options = process.env.QUESTION_OPTIONS.split(",");

// //   // WAIT that option input box is visible (skip question input)
// //   await page.locator('input[data-slot="input"]').nth(1).waitFor({ state: 'visible' });

// //   for (let i = 0; i < options.length; i++) {
// //     const optionInput = page.locator('input[data-slot="input"]').nth(i + 1);

// //     await optionInput.fill(options[i].trim());
// //     console.log(`✔ Added option: ${options[i].trim()}`);
// //     await page.waitForTimeout(300);

// //     if (i < options.length - 1) {
// //       await page.locator('button:has-text("Option")').click();
// //       await page.waitForTimeout(400);
// //     }
// //   }
// // }



// // if (typesWithOptions.includes(questionTypeEnv)) {
// //   console.log("📌 Adding options...");
// //   const options = process.env.QUESTION_OPTIONS.split(",");

// //   for (let i = 0; i < options.length; i++) {
// //     const optionInput = page.locator('input[data-slot="input"]').nth(i + 1);

// //     await optionInput.fill(options[i].trim());
// //     console.log(`✔ Added option: ${options[i].trim()}`);

// //     if (i < options.length - 1) {
// //       await page.getByRole("button", { name: /add option/i }).click();
// //       await page.waitForTimeout(300);
// //     }
// //   }
// // }

// if (typesWithOptions.includes(questionTypeEnv)) {
//   console.log("📌 Adding options...");
//   const options = process.env.QUESTION_OPTIONS.split(",");

//   for (let i = 0; i < options.length; i++) {
//     // Locate the LAST option input always
//     const optionInputs = page.locator('input[placeholder*="Option"]');
//     const lastInput = optionInputs.last();

//     await lastInput.fill(options[i].trim());
//     console.log(`✔ Added option: ${options[i].trim()}`);

//     // Click "Add Option" only if more options left
//     if (i < options.length - 1) {
//       await page.getByRole("button", { name: /add option/i }).click();
//       await page.waitForTimeout(300);
//     }
//   }
// }


// // ---------------------- 🔷 CASE: FILE UPLOAD ---------------------- //
// if (questionTypeEnv === "file upload") {
//   console.log("📌 Selecting file types...");

//   const fileTypes = process.env.FILE_TYPES.split(",");

//   // Open file type dropdown (2nd combobox on page)
//   const fileDropdown = page.locator('button[role="combobox"]').nth(1);
//   await fileDropdown.click();
//   await page.waitForTimeout(500);

//   const fileOptions = page.locator('[role="option"]');
//   const totalFiles = await fileOptions.count();

//   for (let i = 0; i < totalFiles; i++) {
//     const text = (await fileOptions.nth(i).innerText()).toLowerCase();

//     for (let f of fileTypes) {
//       if (text.includes(f.trim().toLowerCase())) {
//         await fileOptions.nth(i).click();
//         console.log(`✔ Selected file type: ${text}`);
//       }
//     }
//   }

//   // Close dropdown
//   await page.keyboard.press("Escape");
//   await page.waitForTimeout(700);
// }

// // ---------------------- 🔷 CASE: TEXT BASED TYPES (Nothing Extra) ---------------------- //
// // Short Answer, Long Answer, Rating, Number, Date Picker → Auto handled

// console.log("🎉 Question setup completed successfully!");
// 🔥 Now we are on the Screening Questions page
console.log("➡ Navigated to Screening Questions Page");


// =================== ADD QUESTIONS DYNAMICALLY =================== //

const total = Number(process.env.TOTAL_QUESTIONS);

for (let q = 1; q <= total; q++) {
  console.log(`\n📌 ADDING QUESTION ${q}`);

  const question = process.env[`QUESTION_${q}`];
  const type = process.env[`TYPE_${q}`].trim().toLowerCase();

  // 👉 Enter Question
  await page.locator('input[name="question"]').fill(question);
  console.log(`✔ Question Entered: ${question}`);
  await page.waitForTimeout(300);

  // 👉 Select Question Type
  await page.locator('button[role="combobox"]').nth(0).click();
  const typeOptions = page.locator('[role="option"]');
  const typeCount = await typeOptions.count();

  let typeFound = false;
  for (let i = 0; i < typeCount; i++) {
    const text = (await typeOptions.nth(i).innerText()).trim().toLowerCase();
    if (text === type) {
      await typeOptions.nth(i).click();
      typeFound = true;
      console.log(`✔ Selected Type: ${text}`);
      break;
    }
  }
  if (!typeFound) {
    console.log("⚠ Type mismatch — Selecting default");
    await typeOptions.nth(0).click();
  }
  await page.waitForTimeout(500);
  await page.waitForLoadState("networkidle");

  // ---------- 🔵 TYPE BASED HANDLING ----------- //
  const typesWithOptions = ["single select", "multiple select", "dropdown"];
  const noExtraTypes = ["short question", "long question", "rating", "date picker", "number"];

  // 🟣 CASE 1 → Single/Multiple/Dropdown → Add options
  if (typesWithOptions.includes(type)) {
    console.log("🔧 Adding Options...");
    const options = (process.env[`OPTIONS_${q}`] || "").split(",").map(x => x.trim()).filter(Boolean);

    if (options.length === 0) {
      console.log("⚠ No options found in .env — skipping...");
    } else {
      for (let i = 0; i < options.length; i++) {
        const input = page.locator('input[data-slot="input"]').nth(i + 1);
        await input.fill(options[i]);
        console.log(`  ✔ Option Added: ${options[i]}`);

        if (i < options.length - 1) {
          await page.getByRole("button", { name: /option/i }).click(); // + Option
        }
        await page.waitForTimeout(250);
      }
    }
  }

  

  // 🟣 CASE 2 → File Upload → Select File Types
else if (type === "file upload") {
  console.log("🔧 Selecting File Types...");

  // 1. Read and process the dynamic data from the environment variable
  // NOTE: Ensure your .env file has a key like FILE_TYPES_Q1="PDF (.pdf), Text File (.txt)"
  const envKey = `FILE_TYPES_${q}`;
  const rawFileTypes = (process.env[envKey] || "")
    .split(",")
    .map(x => x.trim()) // Keep original case/spacing to match UI text exactly
    .filter(Boolean);

  if (rawFileTypes.length === 0) {
    console.log(`⚠ No file types found in environment variable: ${envKey}. Skipping selection.`);
    return;
  }

  // Define the main locator for the dropdown using getByRole for stability
  const ddlFileType = page.getByRole('combobox', { name: 'File Type' });
  
  // 2. Open the main combobox dropdown
  await ddlFileType.click();

  // --- START OF UI-SPECIFIC LOGIC ---
  // If your UI requires an extra click (e.g., a category like 'Transport')
  // to reveal the file type options, keep this line.
  // If not, you can remove it.
  const transportCategory = page.locator('div').filter({ hasText: /^Transport$/ });
  if (await transportCategory.isVisible()) {
    await transportCategory.click();
    console.log('  ✔ Clicked Category: Transport (if required)');
  }
  // --- END OF UI-SPECIFIC LOGIC ---

  // 3. Loop through the dynamic list and click each file type option
  for (const f of rawFileTypes) {
    // Use the highly reliable getByText locator for the options within the open dropdown
    // NOTE: 'f' must exactly match the text of the option (e.g., 'PDF (.pdf)')
    const optionLocator = page.getByText(f, { exact: true });

    // Use isVisible() instead of count() to check for element presence
    if (await optionLocator.isVisible()) {
      // Use standard click, which automatically waits for the element to be ready
      await optionLocator.click(); 
      console.log(`  ✔ Selected File Type: ${f}`);
    } else {
      console.log(`  ⚠ File type option not visible/found: ${f}.`);
      // Consider adding a small manual check here if the option list needs scrolling.
    }
  }

  // 4. Close the dropdown (clicking away, or using the combobox locator again)
  await page.locator('html').click();
  console.log('  ✔ Closed File Type Dropdown');
}

  // 🟣 CASE 3 → No extra fields (short / long / rating / date picker / number)
  else if (noExtraTypes.includes(type)) {
    console.log("ℹ No extra fields for this question type");
  }

  // 🔥 ADD QUESTION → Continue next question
  await page.getByRole("button", { name: /^add question$/i }).click();
  console.log(`🎉 QUESTION ${q} ADDED!`);
  await page.waitForTimeout(1000);
}

console.log("\n🎯 ALL QUESTIONS ADDED SUCCESSFULLY!");
// ================================================================ //
// 👉 Click on NEXT button (Existing navigation step)
await page.getByRole("button", { name: /^next$/i }).click();
console.log("➡ NEXT button clicked successfully!");
await page.waitForTimeout(1000);
const totalStages = Number(process.env.STAGE_COUNT);

for (let i = 1; i <= totalStages; i++) {
  console.log(`🚀 Adding Stage ${i} / ${totalStages}`);

  // --------------------- CLICK STAGE BUTTON ---------------------
  const stageBtn = page.locator('button:has-text("Stage")');
  await stageBtn.waitFor({ state: 'visible', timeout: 15000 });
  await stageBtn.scrollIntoViewIfNeeded();
  await stageBtn.click();
  console.log("📦 Stage button clicked successfully!");

  // --------------------- GET FORM DATA ---------------------
  const stageName = process.env[`STAGE_NAME_${i}`];
  const description = process.env[`SHORT_DESCRIPTION_${i}`];
  const stageType = process.env[`STAGE_TYPE_${i}`]?.trim().toLowerCase();

  // --------------------- FILL STAGE NAME ---------------------
  const nameInput = page.locator('input[name="name"]');
  await nameInput.waitFor({ state: 'visible', timeout: 10000 });
  await nameInput.scrollIntoViewIfNeeded();
  await nameInput.fill(stageName);
  console.log("✔ Stage name entered =", stageName);

  // --------------------- FILL DESCRIPTION ---------------------
  const descInput = page.locator('input[name="description"]');
  await descInput.waitFor({ state: 'visible', timeout: 10000 });
  await descInput.scrollIntoViewIfNeeded();
  await descInput.fill(description);
  console.log("✔ Description entered =", description);

  // --------------------- SELECT STAGE TYPE ---------------------
  if (stageType === "interview") {
    const interviewBtn = page.locator('#Interview');
    await interviewBtn.waitFor({ state: 'visible', timeout: 5000 });
    if ((await interviewBtn.getAttribute('aria-checked')) !== 'true') {
      await interviewBtn.click();
    }
    console.log("✔ Interview selected");
  } else if (stageType === "assessment") {
  const assessmentBtn = page.locator('#Assessment');
  await assessmentBtn.waitFor({ state: 'visible', timeout: 5000 });

  if ((await assessmentBtn.getAttribute('aria-checked')) !== 'true') {
    await assessmentBtn.click();
  }
  console.log("✔ Assessment selected");

  // --------------------- RANDOM MODERATOR ---------------------
  console.log("🎲 Selecting RANDOM Moderator");

  const moderatorDDL = page.locator('button[role="combobox"]').nth(0);
  await moderatorDDL.waitFor({ state: 'visible', timeout: 5000 });
  await moderatorDDL.click();
  await page.waitForTimeout(400);

  const moderatorOptions = page.locator('div[role="option"]');
  const moderatorCount = await moderatorOptions.count();

  if (moderatorCount > 0) {
    const randomModeratorIndex = Math.floor(Math.random() * moderatorCount);
    const moderatorText = await moderatorOptions.nth(randomModeratorIndex).innerText();

    await moderatorOptions.nth(randomModeratorIndex).click({ force: true });
    console.log(`✔ Random Moderator Selected: ${moderatorText}`);
  } else {
    console.log("⚠ No moderator options found");
  }

  // --------------------- RANDOM ASSESSMENT ---------------------
  console.log("🎲 Selecting RANDOM Assessment");

  const assessmentDDL = page.locator('button[role="combobox"]').nth(1);
  await assessmentDDL.waitFor({ state: 'visible', timeout: 5000 });
  await assessmentDDL.click();
  await page.waitForTimeout(400);

  const assessmentOptions = page.locator('div[role="option"]');
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


  // --------------------- CLICK ADD TO SAVE ---------------------
  const addBtn = page.getByRole("button", { name: /^add$/i });
  await addBtn.waitFor({ state: 'visible', timeout: 10000 });
  await addBtn.scrollIntoViewIfNeeded();
  await addBtn.click();
  console.log(`🎉 Stage ${i} saved!`);

  // Short wait before next stage iteration
  await page.waitForTimeout(500);
  console.log("-----------------------------------------\n");
}

console.log("✨✨ All stages added successfully!");


// --------------------- PUBLISH OR SAVE ---------------------
const doPublish = process.env.PUBLISH?.toLowerCase() === "true";

if (doPublish) {
  // --------------------- CLICK PUBLISH ---------------------
  const publishBtn = page.locator('button:has-text("Publish")');
  await publishBtn.waitFor({ state: 'visible', timeout: 15000 });
  await publishBtn.scrollIntoViewIfNeeded();
  await publishBtn.click();
  console.log("🚀 Publish button clicked!");

  // --------------------- CONFIRM PUBLISH ---------------------
  const confirmPublishDialog = page.locator('div[role="dialog"]:has-text("Publish job")');
  await confirmPublishDialog.waitFor({ state: 'visible', timeout: 15000 });

  const yesPublishBtn = confirmPublishDialog.locator('button:has-text("Yes")');
  await yesPublishBtn.waitFor({ state: 'visible', timeout: 10000 });
  await yesPublishBtn.scrollIntoViewIfNeeded();
  await yesPublishBtn.click();
  console.log("✅ Publish confirmation Yes clicked!");


  // Wait for the job publish success popup to appear
const successPopup = page.locator('div[role="dialog"][data-state="open"]');
await successPopup.waitFor({ state: 'visible', timeout: 5000 });

// Click the "OK" button inside the popup
const okButton = successPopup.locator('button', { hasText: 'OK' });
await okButton.click();

  await page.waitForTimeout(1000);

} else {
  // --------------------- CLICK SAVE ---------------------
  const saveBtn = page.getByRole('button', { name: 'Save', exact: true });
  await saveBtn.waitFor({ state: 'visible', timeout: 15000 });
  await saveBtn.scrollIntoViewIfNeeded();
  await saveBtn.click();
  console.log("💾 Save button clicked!");

  // --------------------- CONFIRM SAVE ---------------------
  const confirmSaveDialog = page.locator('div[role="dialog"]:has-text("Save Job as Draft")');
  await confirmSaveDialog.waitFor({ state: 'visible', timeout: 15000 });

  const yesSaveBtn = confirmSaveDialog.locator('button:has-text("Yes")');
  await yesSaveBtn.waitFor({ state: 'visible', timeout: 10000 });
  await yesSaveBtn.scrollIntoViewIfNeeded();
  await yesSaveBtn.click();
  console.log("✅ Save confirmation Yes clicked!");
}

});
