const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();


// ---------- HELPERS ----------
function randomString(min, max) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Utility: generate random string (3–100 chars)
function randomText(min = 3, max = 100) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

test('Create Library', async ({ page }) => {
  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open library
  await page.getByRole('button', { name: 'Library' }).click();

// Click My Library tab
await page.getByRole('button', { name: 'My Library' }).click();

// Click Create Library (+ Library button)
await page
  .locator('button[data-slot="button"]', { hasText: 'Library' })
  .click();

// ---------- ICON SELECTION ----------
const iconDropdown = page.getByRole('combobox').first();
await iconDropdown.waitFor({ state: 'visible' });
await iconDropdown.click();

// Radix renders options in a listbox
const iconOptions = page.locator('[role="listbox"] [role="option"]');
await iconOptions.first().waitFor({ state: 'visible' });

const iconCount = await iconOptions.count();
const randomIconIndex = Math.floor(Math.random() * iconCount);

await iconOptions.nth(randomIconIndex).click();

// ---------- NAME INPUT (3–50 chars) ----------
const libraryName = randomString(3, 50);

const nameInput = page.locator('input[name="name"]');
await nameInput.waitFor({ state: 'visible' });
await nameInput.fill(libraryName);

// ---------- OPTIONAL ASSERTION ----------
await expect(nameInput).toHaveValue(libraryName);

// Open Library Type dropdown
const libraryTypeDropdown = page.getByRole('combobox', { name: 'Library Type' });
await libraryTypeDropdown.waitFor({ state: 'visible' });
await libraryTypeDropdown.click();

// Radix renders options inside a listbox
const options = page.locator('[role="listbox"] [role="option"]');
await options.first().waitFor({ state: 'visible' });

// Pick random option
const optionCount = await options.count();
const randomIndex = Math.floor(Math.random() * optionCount);

const selectedOption = options.nth(randomIndex);
const selectedText = await selectedOption.innerText();

await selectedOption.click();

// Optional assertion (recommended)
await expect(libraryTypeDropdown).toContainText(selectedText);

// Locate Description textarea
const descriptionTextarea = page.getByRole('textbox', { name: 'Description' });
await descriptionTextarea.waitFor({ state: 'visible' });

// Fill random description
const description = randomText(3, 100);
await descriptionTextarea.fill(description);

// Optional assertion
await expect(descriptionTextarea).toHaveValue(description);

await page.getByRole('button', { name: 'Create' }).click();
await page.waitForTimeout(2000);

});