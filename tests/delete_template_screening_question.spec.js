const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();
test('Delete screening question from template', async ({ page }) => {

  // 🔐 Login
  await signIn(page);

  // 📂 Navigate to Screening Questions
  await page.getByRole('button', { name: 'Templates' }).click();
  await page.locator('button', { hasText: 'Screening Questions' }).click();

  // 🧩 Open first template
  const firstTemplate = page.locator('div.cursor-pointer.rounded-\\[12px\\]').first();
  await firstTemplate.locator('button[data-slot="dropdown-menu-trigger"]').click();
  await page.locator('div[role="menuitem"]:has-text("Edit")').click();

  // 💾 Save template (if required)
  await page.locator('button[type="submit"]:has-text("Save")').click();

  // 🧩 Open first question
  const firstQuestion = page.locator('.bg-sub-background.rounded-\\[10px\\].border').first();
  await firstQuestion.locator('button[data-slot="dropdown-menu-trigger"]').click();
  const deleteOption = page.locator('div[role="menuitem"]:has-text("Delete")');

await deleteOption.waitFor({ state: 'visible', timeout: 5000 });
await deleteOption.click();

console.log('🗑️ Delete option clicked');

// Wait for the confirmation dialog to appear
const confirmDialog = page.locator('div[role="dialog"]');
await confirmDialog.waitFor({ state: 'visible', timeout: 5000 });

// Click "Yes, Delete" inside the dialog
await confirmDialog
  .locator('button', { hasText: 'Yes, Delete' })
  .click();

console.log('✅ Confirmed delete');

  });