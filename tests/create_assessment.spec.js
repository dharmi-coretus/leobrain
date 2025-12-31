const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

function randomName(min = 3, max = 30) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function randomDescription(min = 3, max = 100) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('').trim();
}

function randomDuration(min = 1, max = 180) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

test('Create assessment', async ({ page }) => {
  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open assessment
  await page.getByRole('button', { name: 'Assessment' }).click();

  await page
  .getByRole('button', { name: 'Assesment' })
  .waitFor({ state: 'visible', timeout: 5000 });

await page
  .getByRole('button', { name: 'Assesment' })
  .click();
  await page.waitForTimeout(1000);

console.log('✅ Assessment button clicked');


  /* =============================
     Open icon dropdown
  ============================== */
  const iconDropdown = page.locator('button[role="combobox"]').first();
  await iconDropdown.waitFor({ state: 'visible' });
  await iconDropdown.click();

  /* =============================
     Select random icon
  ============================== */
  const iconOptions = page.locator('[role="option"] img');
  const iconCount = await iconOptions.count();

  expect(iconCount).toBeGreaterThan(0);

  const randomIndex = Math.floor(Math.random() * iconCount);
  await iconOptions.nth(randomIndex).click();

  /* =============================
     Enter random name (3–30 chars)
  ============================== */
  const nameInput = page.locator('input[name="name"]');
  const randomAssessmentName = randomName(3, 30);

  await nameInput.fill(randomAssessmentName);

  console.log(`✅ Assessment Name: ${randomAssessmentName}`);


// ---------- Add Description ----------
const descriptionInput = page.locator('input[name="description"]');

await descriptionInput.waitFor({ state: 'visible', timeout: 5000 });

// Clear if any value exists
await descriptionInput.fill('');

// Generate & enter description
const descriptionText = randomDescription(3, 100);
await descriptionInput.type(descriptionText, { delay: 10 });

console.log(`✅ Description added (${descriptionText.length} chars): ${descriptionText}`);


// ---------- Set Duration using plus button ----------
const durationInput = page.locator('input[name="duration"]');
await durationInput.waitFor({ state: 'visible', timeout: 5000 });

// Get current duration value
let currentValue = parseInt(await durationInput.inputValue(), 10);

// Generate target duration
const targetDuration = randomDuration(1, 180);

// Locate PLUS button (button AFTER input)
const plusButton = durationInput.locator('xpath=following-sibling::button');

// Increase duration until target reached
while (currentValue < targetDuration) {
  await plusButton.click();
  currentValue = parseInt(await durationInput.inputValue(), 10);
}

console.log(`⏱️ Duration set to ${currentValue} minutes`);

const createButton = page.locator(
  'button[type="submit"]:has-text("Create")'
);

await createButton.waitFor({ state: 'visible', timeout: 5000 });
await createButton.click();

console.log('✅ Create button clicked');


await page.getByRole('button', { name: 'Question' }).first().click();
console.log('✅ Question button clicked');


// Click the Library dropdown
const libraryDropdown = page.locator('button[role="combobox"]').first();
await libraryDropdown.click();

// Focus on visible dropdown options
const dropdownOptions = page.locator('div[role="listbox"] [role="option"]');

// Wait for options to be visible
await dropdownOptions.first().waitFor({ state: 'visible' });

// Count visible options and pick a safe random index
const visibleCount = await dropdownOptions.count();
const randomIndex2 = Math.floor(Math.random() * visibleCount);

// Click the random option
await dropdownOptions.nth(randomIndex2).click();




    const difficultyRadios = page.locator('div[role="radiogroup"] button[role="radio"]');
  const count = await difficultyRadios.count();

  // 2️⃣ Pick a random index
  const randomIndex1 = Math.floor(Math.random() * count);

  // 3️⃣ Click the random radio button
  await difficultyRadios.nth(randomIndex1).click();

  // 4️⃣ Log which option was selected
  const selectedValue = await difficultyRadios.nth(randomIndex1).getAttribute('value');
  console.log(`✅ Selected difficulty: ${selectedValue}`);

// 1️⃣ Wait for Question Type section to be visible
await page.getByText('Question Type').waitFor({ state: 'visible' });

// 2️⃣ Click Question Type dropdown (stable selector)
const questionTypeDropdown = page
  .getByText('Question Type')
  .locator('..')
  .locator('button[role="combobox"]');

await questionTypeDropdown.click();

// 3️⃣ Locate visible dropdown options
const questionTypeOptions = page.locator('div[role="listbox"] [role="option"]');

// 4️⃣ Ensure options are visible
await questionTypeOptions.first().waitFor({ state: 'visible' });

// 5️⃣ Get count & pick random index
const count2 = await questionTypeOptions.count();
const randomIndex3 = Math.floor(Math.random() * count2);

// 6️⃣ Click random Question Type
await questionTypeOptions.nth(randomIndex3).click();

// Locate the "Get Questions" button by its text
const getQuestionsButton = page.getByRole('button', { name: 'Get Questions' });

// Wait for it to be visible and enabled
await getQuestionsButton.waitFor({ state: 'visible' });

// Click the button
await getQuestionsButton.click();
await page.waitForTimeout(1000);
console.log('✅ "Get Questions" button clicked');

// // 1️⃣ Wait for Select All checkbox to be visible
// const selectAllCheckbox = page.getByRole('checkbox', { name: /select all/i }).first();

// // Fallback if checkbox has no accessible name
// await page.locator('button[role="checkbox"]#select-all').waitFor({ state: 'visible' });

// // 2️⃣ Click Select All checkbox
// await page.locator('button[role="checkbox"]#select-all').click();

// // 3️⃣ Validate checkbox is checked
// await expect(page.locator('button[role="checkbox"]#select-all'))
//   .toHaveAttribute('aria-checked', 'true');

// console.log('✅ Select All checkbox checked');

// // 4️⃣ Wait for Add button
// const addButton = page.getByRole('button', { name: 'Add' });
// await addButton.waitFor({ state: 'visible' });

// // 5️⃣ Click Add button
// await addButton.click();

// console.log('✅ Add button clicked');

for (let i = 1; i <= 4; i++) {
  console.log(`🔁 Iteration ${i} started`);

  // =========================
  // 1️⃣ LIBRARY – RANDOM
  // =========================
  await page.locator('button[role="combobox"]').nth(0).click();
  let options = page.locator('div[role="listbox"] [role="option"]');
  await options.first().waitFor({ state: 'visible' });
  await options.nth(Math.floor(Math.random() * await options.count())).click();

  // ============================
  // 2️⃣ DIFFICULTY – RANDOM
  // ============================
  await page.locator('button[role="combobox"]').nth(1).click();
  options = page.locator('div[role="listbox"] [role="option"]');
  await options.first().waitFor({ state: 'visible' });
  await options.nth(Math.floor(Math.random() * await options.count())).click();

  // ===============================
  // 3️⃣ QUESTION TYPE – RANDOM
  // ===============================
  await page.locator('button[role="combobox"]').nth(2).click();
  options = page.locator('div[role="listbox"] [role="option"]');
  await options.first().waitFor({ state: 'visible' });
  await options.nth(Math.floor(Math.random() * await options.count())).click();

  // ============
  // 4️⃣ APPLY
  // ============
  await page.getByRole('button', { name: 'Apply' }).click();

  // ===============================
  // 5️⃣ WAIT FOR RESULT STATE
  // ===============================
  const noQuestions = page.getByText('No Questions Found');
  const selectAll = page.locator('button[role="checkbox"]#select-all');

  // wait until either appears
  await Promise.race([
    noQuestions.waitFor({ state: 'visible' }).catch(() => {}),
    selectAll.waitFor({ state: 'visible' }).catch(() => {})
  ]);

  // ===============================
  // 6️⃣ HANDLE NO QUESTIONS
  // ===============================
  if (await noQuestions.isVisible()) {
    console.log('⚠️ No Questions Found – skipping');
    continue;
  }

  // =================
  // 7️⃣ SELECT ALL
  // =================
  await selectAll.click();

  // =========
  // 8️⃣ ADD
  // =========
  await page.getByRole('button', { name: 'Add' }).click();
  console.log('✅ Questions added');

  // wait for UI navigation after Add
  await page.waitForLoadState('networkidle');
}

await page.locator('button[data-slot="sheet-close"]').click();
console.log('✅ Sheet closed');

// ============================
// 1️⃣ Click "Ready To Use"
// ============================
await page.getByRole('button', { name: 'Ready To Use' }).click();
console.log('✅ Ready To Use clicked');

// ============================
// 2️⃣ Wait for confirmation dialog
// ============================
const confirmDialog = page.locator('div[role="dialog"]');
await confirmDialog.waitFor({ state: 'visible' });

// Optional validation
await expect(
  page.getByRole('heading', { name: 'Ready to use?' })
).toBeVisible();

console.log('✅ Confirmation popup opened');

// ============================
// 3️⃣ Click "Yes"
// ============================
await page.getByRole('button', { name: 'Yes' }).click();
console.log('✅ Yes clicked');

// ============================
// 4️⃣ Ensure dialog is closed
// ============================
await confirmDialog.waitFor({ state: 'hidden' });


});