const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

// ---------- UTILS ----------
function randomString(min, max) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomDescription(min = 3, max = 100) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.trim();
}

function getRandomQuestion(min = 10, max = 250) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.trim();
}

function getRandomOption(min = 3, max = 50) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.trim();
}

// ---------- ADD QUESTION ----------
async function addQuestion(page, { questionType, optionsCount = 0 }) {
  // Scroll up
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(400);

  // Click "Question" button
  const addQuestionBtn = page
    .locator('button[data-slot="button"]', { hasText: 'Question' })
    .first();
  await addQuestionBtn.waitFor({ state: 'visible' });
  await addQuestionBtn.click();

  // Enter random question
  const questionInput = page.locator('input[name="question"]').first();
  await questionInput.waitFor({ state: 'visible' });
  const questionText = getRandomQuestion();
  await questionInput.fill(questionText);
  console.log(`✅ Question entered: ${questionText}`);

  // Select question type
  const questionTypeDropdown = page
    .locator('button[role="combobox"][data-slot="select-trigger"]')
    .first();
  await questionTypeDropdown.click();

  await page
    .locator('div[role="option"]', { hasText: questionType })
    .first()
    .click();

  console.log(`✅ Question type selected: ${questionType}`);

  // ---------- OPTIONS ----------
  for (let i = 0; i < optionsCount; i++) {
    const optionInput = page.locator(`input[name="options.${i}.value"]`);
    await optionInput.waitFor({ state: 'visible' });
    await optionInput.fill(getRandomOption());

    if (i < optionsCount - 1) {
      await page.locator('button:has-text("Option")').first().click();
    }
  }

// ---------- FILE TYPE RANDOM MULTI SELECT (RADIX – FIXED) ----------
if (questionType === 'File Upload') {

  // 1️⃣ Open File Type dropdown (scope to latest question)
  const fileTypeWrapper = page
    .locator('label', { hasText: 'File Type' })
    .last()
    .locator('..');

  const ddlFileType = fileTypeWrapper.locator('button[role="combobox"]');
  await ddlFileType.waitFor({ state: 'visible', timeout: 5000 });
  await ddlFileType.click();
  console.log('✅ File Type dropdown opened');

  // 2️⃣ Get Radix listbox id
  const listBoxId = await ddlFileType.getAttribute('aria-controls');
  if (!listBoxId) {
    throw new Error('❌ aria-controls not found for File Type dropdown');
  }

  // 3️⃣ Locate the actual dropdown content (PORTAL)
  const listBox = page.locator(`#${listBoxId}`);
  await listBox.waitFor({ state: 'visible', timeout: 5000 });

  // 4️⃣ Get clickable option rows (exclude headers)
  const options = listBox.locator('div')
    .filter({ hasText: /\S/ })           // non-empty
    .filter({ hasNotText: 'Transport' }); // exclude category header

  const total = await options.count();
  console.log(`ℹ Found ${total} File Type options`);

  if (total < 2) {
    console.log('⚠ Not enough File Type options');
  } else {
    // 5️⃣ Pick 2 random unique options
    const selectedIndexes = new Set();
    while (selectedIndexes.size < 2) {
      selectedIndexes.add(Math.floor(Math.random() * total));
    }

    for (const index of selectedIndexes) {
      const option = options.nth(index);
      await option.scrollIntoViewIfNeeded();
      await option.click({ force: true });

      const text = await option.textContent();
      console.log(`✔ Selected File Type: ${text?.trim()}`);
    }
  }

  // 6️⃣ Close dropdown
  await page.keyboard.press('Escape');
  console.log('✅ File Type dropdown closed');
}


  // ---------- Mandatory ----------
  const mandatoryCheckbox = page.locator('button[role="checkbox"][id="is_mandatory"]');
  if ((await mandatoryCheckbox.getAttribute('aria-checked')) !== 'true') {
    await mandatoryCheckbox.click();
    console.log('✅ Mandatory checkbox selected');
  }

  // ---------- Submit ----------
  const submitBtn = page.locator('button[type="submit"]:has-text("Add Question")');
  await submitBtn.waitFor({ state: 'visible' });
  await submitBtn.click();

  console.log(`✅ ${questionType} question added`);

  // Wait for toast to disappear
  const toast = page.locator('section[aria-live="polite"] li');
  if (await toast.count()) {
    await toast.first().waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  }
}

// ---------- TEST ----------
test('Create screening question template and add 9 types of questions', async ({ page }) => {
  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open Templates
  await page.getByRole('button', { name: 'Templates' }).click();
  const screeningQuestionsBtn = page.locator('button', { hasText: 'Screening Questions' });
  await screeningQuestionsBtn.waitFor({ state: 'visible' });
  await screeningQuestionsBtn.click();

  // Click Template button
  const templateButton = page.getByRole('button', { name: 'Template' }).nth(1);
  await templateButton.waitFor({ state: 'visible' });
  await templateButton.click();

  // ---------- ICON SELECTION ----------
  await page.locator('button[role="combobox"][data-slot="select-trigger"]').first().click();
  const iconOption = page.locator('div[role="option"]').first();
  await iconOption.waitFor({ state: 'visible' });
  await iconOption.click();

  // ---------- TEMPLATE DETAILS ----------
  await page.locator('input[name="name"]').fill(randomString(3, 30));
  await page.locator('input[name="description"]').fill(getRandomDescription());

  // Select Template type
  const typeDropdown = page.getByRole('combobox', { name: 'Type' });
  await typeDropdown.waitFor({ state: 'visible' });
  await typeDropdown.click();
  await page.getByRole('option', { name: 'Screening Question' }).click();
  await expect(typeDropdown).toContainText('Screening Question');
  console.log('✅ Type selected: Screening Question');

  // Save template
  await page.locator('button', { hasText: 'Save' }).click();

  // ---------- ADD QUESTIONS ----------
  await addQuestion(page, { questionType: 'Single Select', optionsCount: 2 });
  await addQuestion(page, { questionType: 'Multiple Select', optionsCount: 2 });
  await addQuestion(page, { questionType: 'Long Answer' });
  await addQuestion(page, { questionType: 'Short Answer' });
  await addQuestion(page, { questionType: 'Dropdown', optionsCount: 3 });
  await addQuestion(page, { questionType: 'Number' });
  await addQuestion(page, { questionType: 'Rating' });
  await addQuestion(page, { questionType: 'Date Picker' });
  await addQuestion(page, { questionType: 'File Upload' });

  console.log('✅ All 9 questions added successfully in required order');
});
