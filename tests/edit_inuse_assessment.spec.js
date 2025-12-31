const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

// Utility to generate random string of given length
function randomString(min, max) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomDuration(min = 1, max = 180) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


test('Edit in use assessment', async ({ page }) => {
  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open assessment
  await page.getByRole('button', { name: 'Assessment' }).click();

  const inuseBtn = page.getByRole('button', { name: 'In Use' });

    await inuseBtn.waitFor({ state: 'visible' });
    await inuseBtn.click();

  // Select the first card (escaped Tailwind class)
  const firstCard = page.locator('div.cursor-pointer.rounded-\\[12px\\]').first();

  // Click on the three-dot menu inside the first card
  const menuButton = firstCard.locator('button[data-slot="dropdown-menu-trigger"]');
  await menuButton.click();

  // Click Edit button in dropdown
  const editButton = page.locator('text=Edit');
  await editButton.waitFor({ state: 'visible' });
  await editButton.click();


  // Wait for the modal/dialog
    const modal = page.locator('form[role="dialog"]');
    await expect(modal).toBeVisible();
  
 // 1️⃣ Locate the visible combobox button
const iconDropdown = page.locator('div.min-h-0 button[role="combobox"]').first();
await iconDropdown.waitFor({ state: 'visible' });
await iconDropdown.click(); // open the dropdown

// 2️⃣ Wait for the options to appear
const iconOptions = page.locator('div[role="option"] img'); // icons inside the options
await iconOptions.first().waitFor({ state: 'visible', timeout: 5000 });

// 3️⃣ Count available icons
const iconCount = await iconOptions.count();
if (iconCount === 0) {
    throw new Error('No icons found in the dropdown');
}

// 4️⃣ Pick a random icon
const randomIndex = Math.floor(Math.random() * iconCount);
const randomIcon = iconOptions.nth(randomIndex);
await randomIcon.click(); // select it


    // Fill Name (3-30 chars)
    const nameInput = modal.locator('input[name="name"]');
    await nameInput.fill(randomString(3, 30));
  
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
  
  
    // Click Save
    const saveButton = modal.locator('button:has-text("Save")');
    await saveButton.click();
  
    // Optionally: wait for success toast or modal to disappear
    await expect(modal).toHaveCount(0); // modal closes
  
  
    await page.getByRole('button', { name: 'Question' }).first().click();
  console.log('✅ Question button clicked');


// 🎯 Stable Library dropdown selector
const libraryDropdown = page
  .getByText('Library')
  .locator('..')
  .locator('button[role="combobox"]');

// ⛔ Case 1: Dropdown is disabled (Edit Draft behavior)
if (await libraryDropdown.isDisabled()) {
  console.log('⚠️ Library dropdown is disabled in Edit mode');
} else {
  // 🔍 Get currently selected text
  const libraryText = (await libraryDropdown.textContent())?.trim();

  // ⛔ Case 2: Library already selected (locked by business rule)
  if (libraryText && libraryText.length > 0) {
    console.log(`ℹ️ Library already selected (Edit mode): ${libraryText}`);
  } else {
    // ✅ Case 3: Library is editable → RANDOM selection
    await libraryDropdown.click();

    const options = page.locator('div[role="listbox"] [role="option"]');
    await options.first().waitFor({ state: 'visible' });

    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);

    const randomIndex = Math.floor(Math.random() * optionCount);
    const randomOption = options.nth(randomIndex);

    const selectedText = (await randomOption.textContent())?.trim();
    await randomOption.click();

    console.log(`✅ Random Library selected: ${selectedText}`);
  }
}



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


// 1️⃣ Wait for Select All checkbox to be visible
const selectAllCheckbox = page.getByRole('checkbox', { name: /select all/i }).first();

// Fallback if checkbox has no accessible name
await page.locator('button[role="checkbox"]#select-all').waitFor({ state: 'visible' });

// 2️⃣ Click Select All checkbox
await page.locator('button[role="checkbox"]#select-all').click();

// 3️⃣ Validate checkbox is checked
await expect(page.locator('button[role="checkbox"]#select-all'))
  .toHaveAttribute('aria-checked', 'true');

console.log('✅ Select All checkbox checked');

// 4️⃣ Wait for Add button
const addButton = page.getByRole('button', { name: 'Add' });
await addButton.waitFor({ state: 'visible' });

// 5️⃣ Click Add button
await addButton.click();

console.log('✅ Add button clicked');

for (let i = 1; i <= 4; i++) {
  console.log(`🔁 Iteration ${i} started`);

  // Wait for page to stabilize after any previous navigation
  await page.waitForLoadState('networkidle');

  // -----------------------------
  // 1️⃣ LOCATORS – stable
  // -----------------------------
  const libraryDropdown = page.locator('div.flex.flex-wrap button[role="combobox"]').nth(0);
  const difficultyDropdown = page.locator('div.flex.flex-wrap button[role="combobox"]').nth(1);
  const questionTypeDropdown = page.locator('div.flex.flex-wrap button[role="combobox"]').nth(2);
  const applyButton = page.locator('div.flex.flex-wrap button[data-slot="button"]', { hasText: 'Apply' });

  // -----------------------------
  // 2️⃣ LIBRARY – RANDOM / STABLE
  // -----------------------------
  await libraryDropdown.waitFor({ state: 'visible' });
  const libraryValue = await libraryDropdown.locator('span[data-slot="select-value"]').textContent();
  if (!libraryValue?.trim()) {
    await libraryDropdown.click();
    let options = page.locator('div[role="listbox"] [role="option"]');
    await options.first().waitFor({ state: 'visible' });
    const randomOption = options.nth(Math.floor(Math.random() * await options.count()));
    const selectedText = (await randomOption.textContent())?.trim();
    await randomOption.click();
    console.log(`✅ Random Library selected: ${selectedText}`);
  } else {
    console.log(`ℹ️ Library already selected: ${libraryValue.trim()}`);
  }

  // -----------------------------
  // 3️⃣ DIFFICULTY – RANDOM
  // -----------------------------
  await difficultyDropdown.waitFor({ state: 'visible' });
  await difficultyDropdown.click();
  let options = page.locator('div[role="listbox"] [role="option"]');
  await options.first().waitFor({ state: 'visible' });
  const randomDifficulty = options.nth(Math.floor(Math.random() * await options.count()));
  const difficultyText = (await randomDifficulty.textContent())?.trim();
  await randomDifficulty.click();
  console.log(`✅ Selected difficulty: ${difficultyText}`);

  // -----------------------------
  // 4️⃣ QUESTION TYPE – RANDOM
  // -----------------------------
  await questionTypeDropdown.waitFor({ state: 'visible' });
  await questionTypeDropdown.click();
  options = page.locator('div[role="listbox"] [role="option"]');
  await options.first().waitFor({ state: 'visible' });
  const randomQuestionType = options.nth(Math.floor(Math.random() * await options.count()));
  const questionTypeText = (await randomQuestionType.textContent())?.trim();
  await randomQuestionType.click();
  console.log(`✅ Selected question type: ${questionTypeText}`);

  // -----------------------------
  // 5️⃣ APPLY
  // -----------------------------
  await applyButton.waitFor({ state: 'visible' });
  await applyButton.click();
  console.log('✅ Apply button clicked');

  // -----------------------------
  // 6️⃣ WAIT FOR RESULT STATE
  // -----------------------------
  const noQuestions = page.getByText('No Questions Found');
  const selectAll = page.locator('button[role="checkbox"]#select-all');

  
  await Promise.race([
    noQuestions.waitFor({ state: 'visible' }).catch(() => {}),
    selectAll.waitFor({ state: 'visible' }).catch(() => {})
  ]);

  // -----------------------------
  // 7️⃣ HANDLE NO QUESTIONS
  // -----------------------------
  if (await noQuestions.isVisible()) {
    console.log('⚠️ No Questions Found – skipping');
    continue;
  }

  // -----------------------------
  // 8️⃣ SELECT ALL
  // -----------------------------
  await selectAll.click();

  // -----------------------------
  // 9️⃣ ADD QUESTIONS
  // -----------------------------
  const addButton = page.getByRole('button', { name: 'Add' });
  await addButton.waitFor({ state: 'visible' });
  await addButton.click();
  console.log('✅ Questions added');

  // Wait for UI to stabilize after Add
  await page.waitForLoadState('networkidle');
}


await page.locator('button[data-slot="sheet-close"]').click();
console.log('✅ Sheet closed');

});