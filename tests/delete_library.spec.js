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

test('Delete library', async ({ page }) => {
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

// Click Delete from menu
await page.getByRole('menuitem', { name: 'Delete' }).click();

// Wait for confirmation dialog
const deleteDialog = page.getByRole('dialog', { name: 'Delete Library' });
await expect(deleteDialog).toBeVisible();

// Confirm delete
await deleteDialog.getByRole('button', { name: 'Yes, Delete' }).click();

// Wait for dialog to disappear
await expect(deleteDialog).toBeHidden();


});
