const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

// Utility: generate random string between min & max length
function randomString(min, max) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Utility: generate random string with length range
function randomText(min, max) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.trim();
}

test('Edit library', async ({ page }) => {
  await signIn(page);

  await page.getByRole('button', { name: 'Library' }).click();
  await page.getByRole('button', { name: 'My Library' }).click();



  // 1️⃣ Get the first card
const firstCard = page
  .locator('div.cursor-pointer.rounded-\\[12px\\]')
  .first();

// Ensure card is visible
await expect(firstCard).toBeVisible();

// 2️⃣ Find the menu (3-dot) button inside the first card
const menuButton = firstCard.locator(
  'button[data-slot="dropdown-menu-trigger"]'
);

// Wait until clickable
await expect(menuButton).toBeVisible();
await expect(menuButton).toBeEnabled();

// 3️⃣ Click the menu icon
await menuButton.click();

console.log('✔ Clicked menu icon on first card');

// Wait for the menu item "Edit" to be visible
const editMenuItem = page.getByRole('menuitem', { name: 'Edit' });

await expect(editMenuItem).toBeVisible();
await editMenuItem.click();

console.log('✔ Clicked Edit menu item');

// Locate Name input by label (best practice)
const nameInput = page.getByLabel('Name');

// Wait until visible
await expect(nameInput).toBeVisible();

// Generate valid name (3–50 chars)
const libraryName = randomString(3, 50);

// Clear existing value and fill new name
await nameInput.fill('');
await nameInput.fill(libraryName);

console.log(`✔ Library name updated: "${libraryName}" (${libraryName.length} chars)`);

// Optional assertion
await expect(nameInput).toHaveValue(libraryName);

// 1️⃣ Open the Library Type dropdown
const libraryTypeDropdown = page.getByRole('combobox', { name: 'Library Type' });
await libraryTypeDropdown.click();
console.log('✔ Opened Library Type dropdown');

// 2️⃣ Wait for listbox to appear
const listbox = page.getByRole('listbox');
await listbox.waitFor({ state: 'visible' });

// 3️⃣ Get all options
const options = listbox.getByRole('option');
const optionTotal = await options.count();

// 4️⃣ Pick a random option
const randomIndex = Math.floor(Math.random() * optionTotal);
const randomOption = options.nth(randomIndex);

// Capture text for logging
const selectedText = (await randomOption.textContent())?.trim();

// 5️⃣ Click the random option
await randomOption.click();
console.log(`✔ Selected Library Type: ${selectedText}`);

// 6️⃣ Optional validation (dropdown reflects value)
await expect(libraryTypeDropdown).toContainText(selectedText);

// 1️⃣ Locate Description textarea
const descriptionField = page.locator('textarea[name="description"]');

// 2️⃣ Generate random description (3–100 chars)
const descriptionText = randomText(3, 100);

// 3️⃣ Clear and enter new description
await descriptionField.fill(descriptionText);
console.log(`✔ Description updated (${descriptionText.length} chars)`);

// 4️⃣ Optional validation
await expect(descriptionField).toHaveValue(descriptionText);

const saveButton = page.getByRole('button', { name: 'Save' });
await expect(saveButton).toBeEnabled();
await saveButton.click();
console.log('✔ Clicked Save button');

});