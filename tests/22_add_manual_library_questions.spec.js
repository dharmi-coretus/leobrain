const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

// ----------------- Utilities -----------------
function randomText(min = 10, max = 500) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text.trim();
}

function getRandomItems(arr, count) {
  return arr.sort(() => Math.random() - 0.5).slice(0, count);
}

// ----------------- Helpers -----------------
async function addQuestion(page, type, difficultyLevels, optionsCount = 0, correctCount = 0, answerLength = 0, isNumber = false) {
  await page.getByRole('button', { name: 'Question' }).first().click();
  const questionInput = page.locator('input[name="question"]');
  await questionInput.waitFor({ state: 'visible' });
  await questionInput.fill(randomText(10, 500));

  await page.getByRole('combobox', { name: 'Type' }).click();
  await page.getByRole('option', { name: type }).click();

  const selectedDifficulty = difficultyLevels[Math.floor(Math.random() * difficultyLevels.length)];
  await page.getByRole('radio', { name: selectedDifficulty }).click();

  if (['Single Select', 'Multiple Select'].includes(type)) {
    const optionsSection = page.locator('label', { hasText: 'Options' }).locator('..');
    const optionInputs = optionsSection.locator('input[type="text"]');
    const addOptionButton = optionsSection.locator('button').filter({ has: page.locator('svg[width="20"][height="20"]') }).last();
    const correctIcons = optionsSection.locator('button:has(svg[width="28"][height="28"])');

    // Fill options
    for (let i = 0; i < optionsCount; i++) {
      if (i > 0) await addOptionButton.click({ force: true });
      await optionInputs.nth(i).fill(randomText(1, 100));
    }

    // Select correct options
    const correctIndexes = getRandomItems([...Array(optionsCount).keys()], correctCount);
    for (const idx of correctIndexes) {
      await correctIcons.nth(idx).click({ force: true });
    }
  } else {
    const answerTextarea = page.locator('textarea[name="single_answer"]');
    await answerTextarea.waitFor({ state: 'visible' });
    const answer = isNumber
      ? Math.floor(Math.random() * 10000) + 1
      : randomText(1, answerLength);
    await answerTextarea.fill(answer.toString());
  }

  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForLoadState('networkidle');
}

// ----------------- Test -----------------
test('Create Library - Add Multiple Question Types', async ({ page }) => {
  await signIn(page);

  await page.getByRole('button', { name: 'Library' }).click();
  await page.getByRole('button', { name: 'My Library' }).click();

  const firstLibraryCard = page.locator('div.space-y-5 > div.cursor-pointer').first();
  await firstLibraryCard.click();
  await page.waitForLoadState('networkidle');

  // Define difficulty arrays for each type
  const selectLevels = ['Easy', 'Medium', 'Hard'];
  const textLevels = ['Easy', 'Medium', 'Hard'];

  // Add questions
  await addQuestion(page, 'Single Select', selectLevels, 2, 1);       // 2 options, 1 correct
  await addQuestion(page, 'Multiple Select', selectLevels, 3, 2);     // 3 options, 2 correct
  await addQuestion(page, 'Long Answer', textLevels, 0, 0, 1000);     // long answer
  await addQuestion(page, 'Short Answer', textLevels, 0, 0, 200);     // short answer
  await addQuestion(page, 'Number', textLevels, 0, 0, 0, true);       // number answer
});
