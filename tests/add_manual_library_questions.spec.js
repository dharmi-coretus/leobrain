const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

// ----------------- Utilities -----------------
function randomString(min, max) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ----------------- Test -----------------
test('Create Library - Add All Question Types', async ({ page }) => {
  // Sign in
  await signIn(page);

  // Open Library
  await page.getByRole('button', { name: 'Library' }).click();
  await page.getByRole('button', { name: 'My Library' }).click();

  // Wait for first library card and click
  const firstLibraryCard = page.locator('div.space-y-5 > div.cursor-pointer').first();
  await firstLibraryCard.waitFor({ state: 'visible' });
  await firstLibraryCard.click();
  await page.waitForLoadState('networkidle');

  // Define all question types
  const questionTypes = ['Single Select', 'Multiple Select', 'Long Answer', 'Short Answer', 'Number'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  // Loop through each question type
  for (const type of questionTypes) {
    // Ensure Question button is visible and click
    await page.waitForSelector('button:has-text("Question")', { timeout: 15000 });
    await page.locator('button:has-text("Question")').click();

    // Fill question text
    const questionText = randomString(10, 500);
    await page.locator('input[name="question"]').fill(questionText);

  // 1. Select question type (Single Select)
const selectedType = 'Single Select';
await page.locator('button[role="combobox"]').click();
const dropdownOption = page.locator('div[role="option"]', { hasText: selectedType });
await dropdownOption.waitFor({ state: 'visible' });
await dropdownOption.click();

// 2. Fill first option
const firstOptionInput = page.locator('div[data-slot="input"]').nth(0);
await firstOptionInput.waitFor({ state: 'visible' });
await firstOptionInput.fill(randomString(1, 100));

// 3. Click +Option to add second option
await page.locator('button:has-text("Option")').click();

// 4. Fill second option
const secondOptionInput = page.locator('div[data-slot="input"]').nth(1);
await secondOptionInput.waitFor({ state: 'visible' });
await secondOptionInput.fill(randomString(1, 100));

// 5. Select one random option as correct
const correctIndex = Math.floor(Math.random() * 2); // 0 or 1
await page.locator('rect[width="28"][height="28"]').nth(correctIndex).click();

    // Select random difficulty
    const selectedDifficulty = randomChoice(difficulties);
    await page.locator(`button[role="radio"][value="${selectedDifficulty}"]`).click();

    // Click Add button
    await page.locator('button:has-text("Add")').click();
  }
});
