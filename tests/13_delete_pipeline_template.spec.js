const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();
// ---------- TEST ----------
test('Go to template menu and delete pipeline template', async ({ page }) => {

  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open Templates
  await page.getByRole('button', { name: 'Templates' }).click();

  const pipelineButton = page.locator('button', { hasText: 'Pipeline' });
  await pipelineButton.waitFor({ state: 'visible' });
  await pipelineButton.click();

  // Target first template card
const firstTemplateCard = page
  .locator('div.cursor-pointer.rounded-\\[12px\\]')
  .first();

// Click action (3-dot) menu
const actionButton = firstTemplateCard.locator(
  'button[data-slot="dropdown-menu-trigger"]'
);
await actionButton.waitFor({ state: 'visible' });
await actionButton.click();

// Click Delete option
const duplicateButton = page.locator(
  'div[role="menuitem"]:has-text("Delete")'
);
await duplicateButton.waitFor({ state: 'visible' , timeout: 5000});
await duplicateButton.click();
await page.waitForTimeout(1000);

// 1️⃣ Wait for Delete Template dialog to appear
const deleteTemplateDialog = page.locator(
  'div[role="dialog"]',
  { hasText: 'Delete Template' }
);

await deleteTemplateDialog.waitFor({ state: 'visible', timeout: 5000 });

// 2️⃣ Click "Yes, Delete" button
const yesDeleteButton = deleteTemplateDialog.locator(
  'button:has-text("Yes, Delete")'
);

await yesDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
await yesDeleteButton.click();

console.log('✅ Template deleted successfully');

});