// tests/createJob.spec.js
const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

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

// Step 4: Validate Job Title field

 const jobTitleInput = page.locator('input[name="job_details.job_title"]');
 await jobTitleInput.waitFor({ state: 'visible' });


// --- Validation 1: Required field ---
 // await jobTitleInput.click();
 // await jobTitleInput.fill('');
// await page.keyboard.press('Enter');
// await page.waitForTimeout(500);
// await expect(page.getByText(/required/i)).toBeVisible();
// console.log('✅ Required field validation works');


 // --- Validation 2: Minimum 3 characters ---

 await jobTitleInput.fill('QA');
 await page.keyboard.press('Enter'); // press Enter to trigger validation
 await page.waitForTimeout(500);

const minLengthError = page.getByText(/at least 3/i);
 await expect(minLengthError).toBeVisible();
 console.log('✅ Validation: "Minimum 3 characters" message displayed');

 // --- Validation 3: Maximum 100 characters ---
 const longTitle = 'A'.repeat(101);
 await jobTitleInput.fill(longTitle);
 await page.keyboard.press('Enter'); // trigger validation
// await page.waitForTimeout(500);

 const maxLengthError = page.getByText(/exceed 100/i);
 await expect(maxLengthError).toBeVisible();
 console.log('✅ Validation: "Maximum 100 characters" message displayed');

 // --- Now enter valid job title from env ---
const jobTitle = process.env.JOB_TITLE;
await jobTitleInput.fill(jobTitle);
 await expect(jobTitleInput).toHaveValue(jobTitle);
console.log(`✅ Job Title entered: ${jobTitle}`);

//  /*// Step 4: Fill Job Title (from .env)
//   const jobTitle = process.env.JOB_TITLE;
//   const jobTitleInput = page.locator('input[name="job_details.job_title"]');
//   await jobTitleInput.waitFor({ state: 'visible' });
//   await jobTitleInput.click();
//   await jobTitleInput.fill(jobTitle);
//   await page.waitForTimeout(1000);

//   // Step 5: Verify Job Title entered
//   await expect(jobTitleInput).toHaveValue(jobTitle);
// */

   // Optional page verification
 await expect(page).toHaveURL(/recruitment\/job-create\/details/);
   await expect(page.locator('h1')).toHaveText(/Create Job/i);

// Step 6: Select Department dynamically
  const departmentDropdown = page.locator('button[role="combobox"]').first();
  await departmentDropdown.waitFor({ state: 'visible' });
  await departmentDropdown.click();
  await page.waitForTimeout(1000);

 const options = page.locator('[role="option"]');
  const count = await options.count();

  if (count > 0) {
     const departmentName = process.env.DEPARTMENT?.trim();

    // Try to match env department first
    if (departmentName) {
      let matched = false;
      for (let i = 0; i < count; i++) {
        const text = await options.nth(i).innerText();
        if (text.trim().toLowerCase() === departmentName.toLowerCase()) {
          await options.nth(i).click();
          console.log(`✅ Selected Department from env: ${departmentName}`);
          matched = true;
          break;
        }
      }
      // Fallback to random selection if not matched
      if (!matched) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
        console.log(`⚠️ Department "${departmentName}" not found — selected random: index ${randomIndex + 1}`);
      }
    } else {
      // No DEPARTMENT set in env → random selection
      const randomIndex = Math.floor(Math.random() * count);
      await options.nth(randomIndex).click();
      console.log(`ℹ️ No DEPARTMENT in .env — selected random department index: ${randomIndex + 1}`);
    }
  } else {
    console.warn('⚠️ No department options found');
  }

  await page.waitForTimeout(1000);

 // Step: Set number of openings dynamically using env value
const openings = parseInt(process.env.OPENINGS || '1', 10); // default = 1
console.log(`🧩 Openings to set: ${openings}`);

// --- FIX 1: Use a more stable container locator ---
// Locate the main container element that holds the input and buttons.
// We can use the input's name attribute to find its parent div.
const inputLocator = page.locator('input[name="job_details.openings"]');
const containerLocator = inputLocator.locator('..'); // The parent div of the input

// --- FIX 2: Locate buttons by their SVG content ---
// The minus button has the horizontal line SVG path: d="M4.16602 10H15.8327"
const minusButton = containerLocator.locator('button', { has: page.locator('path[d="M4.16602 10H15.8327"]') });
// The plus button has the cross SVG path: d="M14.9994 10.8307H..."
const plusButton = containerLocator.locator('button', { has: page.locator('path[d^="M14.9994 10.8307H"]') });


// 1. Optional: reset to 1 by clicking minus until disabled
try {
    // Wait for the buttons to be ready
    await minusButton.waitFor({ state: 'visible' }); 
    
    let currentValue = parseInt(await inputLocator.inputValue(), 10);

    // If the current value is already the target, skip the loop
    if (currentValue === openings) {
        console.log(`✅ Openings already set to ${openings}`);
        return;
    }
    
    // Reset to min value (if necessary)
    while (currentValue > 1) { // Assuming 1 is the minimum value
        await minusButton.click();
        await page.waitForTimeout(50); // Small pause for UI update
        currentValue = parseInt(await inputLocator.inputValue(), 10);
    }
} catch (error) {
    console.log('Resetting complete or button state issue:', error);
}

// 2. Click + button (openings - 1) times
// We can now start the counter from 1 since the reset should have set it to 1
for (let i = 1; i < openings; i++) {
    await plusButton.click();
    await page.waitForTimeout(50); // Use a shorter, consistent pause
}

// 3. Verification
const finalValue = await inputLocator.inputValue();
console.log(`✅ Number of openings set to ${finalValue}`);

// Assert the final value
await expect(finalValue).toBe(openings.toString());

// --- Step: Select Work Shift dynamically ---
await page.waitForTimeout(1000);

// Locate the Work Shift dropdown (assuming it's the next combobox after Department)
const workShiftDropdown = page.locator('button[role="combobox"]').nth(1);
await workShiftDropdown.waitFor({ state: 'visible' });
await workShiftDropdown.click();
await page.waitForTimeout(1000);

// Get all available options
const shiftOptions = page.locator('[role="option"]');
const shiftCount = await shiftOptions.count();

if (shiftCount > 0) {
  const shiftFromEnv = process.env.WORK_SHIFT?.trim();

  if (shiftFromEnv) {
    let matched = false;
    for (let i = 0; i < shiftCount; i++) {
      const optionText = await shiftOptions.nth(i).innerText();
      if (optionText.trim().toLowerCase() === shiftFromEnv.toLowerCase()) {
        await shiftOptions.nth(i).click();
        console.log(`✅ Selected Work Shift from .env: ${shiftFromEnv}`);
        matched = true;
        break;
      }
    }
    if (!matched) {
      const randomIndex = Math.floor(Math.random() * shiftCount);
      await shiftOptions.nth(randomIndex).click();
      console.log(`⚠️ Work Shift "${shiftFromEnv}" not found — selected random index ${randomIndex + 1}`);
    }
  } else {
    const randomIndex = Math.floor(Math.random() * shiftCount);
    await shiftOptions.nth(randomIndex).click();
    console.log(`ℹ️ No WORK_SHIFT in .env — selected random Work Shift index: ${randomIndex + 1}`);
  }
} else {
  console.warn('⚠️ No Work Shift options found');
}

await page.waitForTimeout(1000);
// --- Step: Select Work Place dynamically (radio buttons) ---
await page.waitForTimeout(1000);
console.log('🌍 Selecting Work Place...');

// Read from .env or choose random fallback
const workPlaceFromEnv = process.env.WORK_PLACE?.trim() || '';

let workPlaceValue;
if (workPlaceFromEnv) {
  workPlaceValue = workPlaceFromEnv;
} else {
  // fallback random option
  const allPlaces = ['Onsite', 'Remote', 'Hybrid'];
  workPlaceValue = allPlaces[Math.floor(Math.random() * allPlaces.length)];
}

// Locate all radio buttons
const workPlaceOptions = page.locator('[role="radio"]');
const radioCount = await workPlaceOptions.count();  // ✅ renamed variable

for (let i = 0; i < radioCount; i++) {
  const option = workPlaceOptions.nth(i);
  const value = await option.getAttribute('value');

  if (value?.toLowerCase() === workPlaceValue.toLowerCase()) {
    await option.click();
    console.log(`✅ Work Place selected: ${value}`);
    break;
  }
}

await page.waitForTimeout(500);

 // --- Step: Expiry Date validation and entry ---
console.log('📅 Starting expiry date validation...');

const dateInput = page.locator('#date');
await dateInput.waitFor({ state: 'visible' });
await dateInput.click();
await page.waitForTimeout(1000);

// --- Step 1: Calculate min and max dates ---
const today = new Date();
const minDate = new Date(today);
minDate.setDate(today.getDate() + 1);

const maxDate = new Date(today);
maxDate.setDate(today.getDate() + 90);

const formatDate = (d) => d.toISOString().split('T')[0];

const minFormatted = formatDate(minDate);
const maxFormatted = formatDate(maxDate);

console.log(`🧭 Min allowed date: ${minFormatted}`);
console.log(`🧭 Max allowed date: ${maxFormatted}`);

// --- Step 2: Test below minimum date ---
const belowMin = new Date(today);
belowMin.setDate(today.getDate()); // today (invalid)
const belowMinFormatted = formatDate(belowMin);

await dateInput.evaluate((el, value) => (el.value = value), belowMinFormatted);
await page.keyboard.press('Enter');
await page.waitForTimeout(1000);

const minError = page.getByText(/minimum date/i);
if (await minError.isVisible()) {
  console.log('✅ Validation: Minimum date message displayed');
} else {
  console.warn('⚠️ Minimum date validation message not found');
}

// --- Step 3: Test above maximum date ---
const aboveMax = new Date(today);
aboveMax.setDate(today.getDate() + 91);
const aboveMaxFormatted = formatDate(aboveMax);

await dateInput.evaluate((el, value) => (el.value = value), aboveMaxFormatted);
await page.keyboard.press('Enter');
await page.waitForTimeout(1000);

const maxError = page.getByText(/maximum date/i);
if (await maxError.isVisible()) {
  console.log('✅ Validation: Maximum date message displayed');
} else {
  console.warn('⚠️ Maximum date validation message not found');
}

// --- Step 4: Enter valid expiry date (from env or default mid date) ---
const envExpiryDate = process.env.EXPIRY_DATE;
let finalDate = envExpiryDate;

// if not in env, choose mid-range date (45 days from today)
if (!finalDate) {
  const midDate = new Date(today);
  midDate.setDate(today.getDate() + 45);
  finalDate = formatDate(midDate);
}

await dateInput.evaluate((el, value) => (el.value = value), finalDate);

await page.keyboard.press('Enter');
await page.waitForTimeout(1000);

console.log(`✅ Valid expiry date set: ${finalDate}`);

const companyNameEnv = process.env.COMPANY_NAME?.trim().toLowerCase() || '';
console.log(`🏢 Selecting company: ${companyNameEnv}`);

// --- Target the "Company Name" dropdown ---
const companyDropdown = page.locator('label:has-text("Company Name")')
  .locator('xpath=following-sibling::button[@role="combobox"]');
await companyDropdown.waitFor({ state: 'visible', timeout: 10000 });
await companyDropdown.click();
await page.waitForTimeout(500);

// --- Wait for dropdown options to appear ---
const companyListbox = page.locator('[role="listbox"]');
await companyListbox.waitFor({ state: 'visible', timeout: 10000 });

// --- Get all options/buttons in dropdown ---
const companyOptions = companyListbox.locator('[role="option"], button');
const companyOptionsCount = await companyOptions.count(); // ✅ unique variable

let companyFound = false;

// --- Loop through and match with env company name ---
for (let c = 0; c < companyOptionsCount; c++) {
  const option = companyOptions.nth(c);
  const value = (await option.innerText()).trim().toLowerCase();

  if (value.includes(companyNameEnv)) {
    await option.click();
    console.log(`✅ Selected existing company: ${value}`);
    companyFound = true;
    break;
  }
}

// --- If not found, click the "Create Company" button ---
if (!companyFound && companyOptionsCount > 0) {
  const createCompanyBtn = companyOptions.last();
  const btnText = (await createCompanyBtn.innerText()).trim();
  await createCompanyBtn.click({ force: true });
  console.log(`⚙️ Company not found — clicked "${btnText}" to create new one`);
}

await page.waitForTimeout(1000);

console.log("📍 Selecting Location...");

const envLocation = process.env.JOB_LOCATION?.trim() || "";

// 1️⃣ Get dropdown button by label
const locationDropdownBtn = page.getByLabel("Location", { exact: true });

// 2️⃣ Click dropdown
await locationDropdownBtn.waitFor({ state: "visible" });
await locationDropdownBtn.click();
await page.waitForTimeout(300);

// 3️⃣ Get options
const locationOptions = page.locator('[role="option"]');
const optionCount = await locationOptions.count();

let optionValues = [];
for (let i = 0; i < optionCount; i++) {
  optionValues.push(await locationOptions.nth(i).innerText());
}

console.log("📋 Location Options:", optionValues);

// 4️⃣ Match env or random
if (envLocation && optionValues.includes(envLocation)) {
  console.log(`✅ Matched location: ${envLocation}`);
  await page.getByRole("option", { name: envLocation }).click();
} else {
  const randomOption = optionValues[Math.floor(Math.random() * optionValues.length)];
  console.log(`⚠️ No match → Selecting random: ${randomOption}`);
  await page.getByRole("option", { name: randomOption }).click();
}

await page.waitForTimeout(500);

console.log("📍 Selecting Experience...");

const envExperience = process.env.EXPERIENCE?.trim() || "";

// 1️⃣ Target only the Experience dropdown
const expDropdown = page.getByRole("combobox", { name: "Experience" });

// 2️⃣ Click to open
await expDropdown.waitFor();
await expDropdown.click();
await page.waitForTimeout(300);

// 3️⃣ Get all dropdown options
const expOptions = page.getByRole("option");
const expCount = await expOptions.count();

let allExpValues = [];
for (let i = 0; i < expCount; i++) {
  allExpValues.push(await expOptions.nth(i).innerText());
}

console.log("📋 Experience Options:", allExpValues);

// 4️⃣ Match from env OR choose random
if (envExperience && allExpValues.includes(envExperience)) {
  console.log(`✅ Matched: ${envExperience}`);
  await page.getByRole("option", { name: envExperience }).click();
} else {
  const randomExp = allExpValues[Math.floor(Math.random() * allExpValues.length)];
  console.log(`⚠️ No match -> Selecting random: ${randomExp}`);
  await page.getByRole("option", { name: randomExp }).click();
}

await page.waitForTimeout(300);


console.log("📍 Selecting Employment Type...");

// Read ENV value
const envEmploymentType = process.env.EMPLOYMENT_TYPE?.trim() || "";

// 1️⃣ Select the dropdown using accessible label
const empTypeDropdown = page.getByRole("combobox", { name: "Employment Type" });

// 2️⃣ Open dropdown
await empTypeDropdown.waitFor();
await empTypeDropdown.click();
await page.waitForTimeout(300);

// 3️⃣ Fetch all dropdown options
const empOptions = page.getByRole("option");
const totalEmpOptions = await empOptions.count();

let allEmpValues = [];
for (let i = 0; i < totalEmpOptions; i++) {
  allEmpValues.push(await empOptions.nth(i).innerText());
}

console.log("📋 Employment Type Options:", allEmpValues);

// 4️⃣ Match ENV value or pick random
if (envEmploymentType && allEmpValues.includes(envEmploymentType)) {
  console.log(`✅ Matched: ${envEmploymentType}`);
  await page.getByRole("option", { name: envEmploymentType }).click();
} else {
  const randomEmp = allEmpValues[Math.floor(Math.random() * allEmpValues.length)];
  console.log(`⚠️ No match found → Selecting random: ${randomEmp}`);
  await page.getByRole("option", { name: randomEmp }).click();
}

await page.waitForTimeout(300);

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

// PAY STRUCTURE DROPDOWN
const payStructureDropdown = page.getByRole('combobox', { name: 'Pay Structure' });
await payStructureDropdown.click();
await page.waitForTimeout(500);

const payItems = page.locator('[data-slot="select-item"]');
const payList = await payItems.allInnerTexts();

// ENV value
const payEnvValue = process.env.PAY_STRUCTURE?.trim();

// Pick final value
let finalPayValue = payList.includes(payEnvValue)
  ? payEnvValue
  : payList[Math.floor(Math.random() * payList.length)];

await payItems.filter({ hasText: finalPayValue }).first().click();

console.log(`✔ Selected Pay Structure: ${finalPayValue}`);

// ==== PAY TERMS DROPDOWN ====

// Click the "Pay Terms" dropdown (2nd dropdown)
const payTermsDropdown = page.locator('button[role="combobox"]').nth(1);
await payTermsDropdown.click();
await page.waitForTimeout(500);

// Get all dropdown options
const payTermsOptions = page.locator('[data-slot="select-item"]');
const availableTerms = await payTermsOptions.allInnerTexts();

// ENV Value
const envPayTerms = process.env.PAY_TERMS?.trim();

// Choose env value if available, else random
const selectedPayTerms = availableTerms.includes(envPayTerms)
  ? envPayTerms
  : availableTerms[Math.floor(Math.random() * availableTerms.length)];

// Click selected value
await payTermsOptions.filter({ hasText: selectedPayTerms }).first().click();

console.log(`✔ Selected Pay Terms: ${selectedPayTerms}`);

// ==== CURRENCY DROPDOWN ====

// Click the "Currency" dropdown (3rd combobox)
const currencyDropdown = page.locator('button[role="combobox"]').nth(2);
await currencyDropdown.click();
await page.waitForTimeout(500);

// Get available currency options
const currencyOptions = page.locator('[data-slot="select-item"]');
const availableCurrencies = await currencyOptions.allInnerTexts();

// ENV Value
const envCurrency = process.env.CURRENCY?.trim();

// Choose env value if exists else random
const selectedCurrency = availableCurrencies.includes(envCurrency)
  ? envCurrency
  : availableCurrencies[Math.floor(Math.random() * availableCurrencies.length)];

// Click selected value
await currencyOptions.filter({ hasText: selectedCurrency }).first().click();

console.log(`✔ Selected Currency: ${selectedCurrency}`);


// ======== READ ENV VALUES ========
const salaryTypeEnv = process.env.SALARY_TYPE?.trim();
const amountEnv = process.env.SALARY_AMOUNT;
const minEnv = process.env.SALARY_MIN;
const maxEnv = process.env.SALARY_MAX;

// ======== SELECT RADIO BUTTON BASED ON TYPE ========
const salaryTypeButtons = page.locator('div[role="radiogroup"] button[role="radio"]');

const availableTypes = await salaryTypeButtons.evaluateAll(btns =>
  btns.map(btn => btn.getAttribute('value'))
);

const finalSalaryType = availableTypes.includes(salaryTypeEnv)
  ? salaryTypeEnv
  : availableTypes[Math.floor(Math.random() * availableTypes.length)];

await page.locator(`button[role="radio"][value="${finalSalaryType}"]`).click();
console.log(`✔ Salary Type Selected: ${finalSalaryType}`);

await page.waitForTimeout(500);

// ======== FILL FIELDS BASED ON TYPE ========

// ------------------ FIXED --------------------
if (finalSalaryType === "Fixed") {
  const amountInput = page.locator('input[name="amount"]');
  await amountInput.fill(amountEnv || "50000"); // fallback
  console.log("✔ Fixed Salary Amount Entered");
}

// ------------------ RANGE --------------------
else if (finalSalaryType === "Range") {
  const minInput = page.locator('input[name="minimum"]');
  const maxInput = page.locator('input[name="maximum"]');

  await minInput.fill(minEnv || "40000");
  await page.waitForTimeout(300);
  await maxInput.fill(maxEnv || "90000");

  console.log("✔ Range Salary Entered (Min + Max)");
}

// ------------------ UPTO --------------------
else if (finalSalaryType === "Upto") {
  const uptoInput = page.locator('input[name="amount"]');
  await uptoInput.fill(amountEnv || "100000");
  console.log("✔ Upto Amount Entered");
}

// ------------------ FROM --------------------
else if (finalSalaryType === "From") {
  const fromInput = page.locator('input[name="amount"]');
  await fromInput.fill(amountEnv || "60000");
  console.log("✔ From Amount Entered");
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


//---------------Recruiter name---------------------//
// Get recruiter name from env
const recruiterNameEnv = process.env.RECRUITER_NAME;



const recruiterDropdown = page.locator('button[role="combobox"]').nth(3);
await recruiterDropdown.click();
await page.waitForTimeout(500);
// Open dropdown
//await page.locator('button[role="combobox"]').click();
//await page.waitForTimeout(300);

// Get all recruiter options
const recruiterOptions = page.locator('[role="option"]');
const recruiterCount = await recruiterOptions.count();

let recruiterFound = false;

// Match with env name
for (let i = 0; i < recruiterCount; i++) {
  const recruiterText = await recruiterOptions.nth(i).innerText();

  if (
    recruiterNameEnv &&
    recruiterText.trim().toLowerCase() === recruiterNameEnv.trim().toLowerCase()
  ) {
    await recruiterOptions.nth(i).click();
    console.log(`Selected recruiter from ENV: ${recruiterText}`);
    recruiterFound = true;
    break;
  }
}

// If no match → random select
if (!recruiterFound) {
  const randomIndex = Math.floor(Math.random() * recruiterCount);
  const selected = await recruiterOptions.nth(randomIndex).innerText();
  await recruiterOptions.nth(randomIndex).click();
  console.log(`Selected RANDOM recruiter: ${selected}`);
}

// ----------- Recruiter Email Auto-Fill Override ------------- //
const recruiterEmailEnv = process.env.RECRUITER_EMAIL;

// Email input locator
const emailInput = page.locator('input[name="email"]');

// Wait to ensure auto-filled value appears
await page.waitForTimeout(1000);

if (recruiterEmailEnv && recruiterEmailEnv.trim() !== "") {
  // Clear existing auto-filled email
  await emailInput.fill("");
  await emailInput.fill(recruiterEmailEnv.trim());

  console.log(`Email overridden with ENV value: ${recruiterEmailEnv}`);
} else {
  const autoEmail = await emailInput.inputValue();
  console.log(`Using auto-filled email: ${autoEmail}`);

  // 👀 Also wait if using auto email
  await page.waitForTimeout(2000);
}
// ====== ENV Values ====== //
const countryNameEnv = process.env.COUNTRY_CODE?.trim(); // e.g., "India"
const phoneNumberEnv = process.env.PHONE_NUMBER?.trim(); // e.g., "9876543210"

// 1️⃣ Open Country Dropdown
await page.getByRole('combobox', { name: 'Country selector' }).click();
  await page.getByRole('option', { name: 'Hong Kong +' }).click();
  await page.locator('input[name="phone"]').click();
  await page.locator('input[name="phone"]').fill('+852 3453 45345');

// 4️⃣ Enter Phone Number
const phoneInput = page.locator('input[name="phone"]');
await phoneInput.fill('');
await phoneInput.type(phoneNumberEnv);
console.log(`📱 Phone Number Entered: ${phoneNumberEnv}`);

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

  // // 🟣 CASE 2 → File Upload → Select File Types
  // else if (type === "file upload") {
  //   console.log("🔧 Selecting File Types...");
  //   const fileTypes = (process.env[`FILE_TYPES_${q}`] || "")
  //     .split(",")
  //     .map(x => x.trim().toLowerCase())
  //     .filter(Boolean);

  //   const ddlFileType = page.locator('button[role="combobox"]').nth(1);

  //   for (const f of fileTypes) {
  //     await ddlFileType.click();
  //     await page.waitForTimeout(350);

  //     const option = page.locator(
  //       `//div[contains(@class,'flex')][.//text()[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "${f}")]]`
  //     );

  //     if (await option.count()) {
  //       await option.click();
  //       console.log(`  ✔ Selected File Type: ${f}`);
  //     } else {
  //       console.log(`  ⚠ File type not found: ${f}`);
  //     }
  //     await page.waitForTimeout(250);
  //   }
  // }

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

    // --------------------- MODERATOR ---------------------
    const moderatorName = process.env[`MODERATOR_NAME_${i}`];
    const moderatorDDL = page.locator('button[role="combobox"]').nth(0);
    await moderatorDDL.waitFor({ state: 'visible', timeout: 5000 });
    await moderatorDDL.click();
    const moderatorOption = page.locator(`div[role="option"] span:text-is("${moderatorName}")`).first();
    await moderatorOption.waitFor({ state: 'visible', timeout: 5000 });
    await moderatorOption.click();
    console.log("✔ Moderator =", moderatorName);

    // --------------------- ASSESSMENT ---------------------
    const assessmentName = process.env[`ASSESSMENT_NAME_${i}`];
    const assessmentDDL = page.locator('button[role="combobox"]').nth(1);
    await assessmentDDL.waitFor({ state: 'visible', timeout: 5000 });
    await assessmentDDL.click();
    const assessmentOption = page.locator(`div[role="option"] span:text-is("${assessmentName}")`).first();
    await assessmentOption.waitFor({ state: 'visible', timeout: 5000 });
    await assessmentOption.click();
    console.log("✔ Assessment =", assessmentName);
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
