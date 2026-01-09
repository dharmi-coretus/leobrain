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
  await page.locator('div[role="menuitem"]:has-text("Delete")').click();

console.log('🗑️ Delete option clicked');
// ⚠️ Define & wait for confirmation dialog
const deleteDialog = page.locator('div[role="dialog"]', {
  has: page.locator('h2', { hasText: /Delete/i })
});

await deleteDialog.waitFor({ state: 'visible', timeout: 5000 });

console.log('⚠️ Delete confirmation dialog opened');

// ✅ Click "Yes, Delete"
await deleteDialog
  .locator('button', { hasText: 'Yes, Delete' })
  .click();

console.log('✅ Yes, Delete clicked');

});