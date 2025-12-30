const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();
// ---------- TEST ----------
test('Go to template menu and create duplicate pipeline template', async ({ page }) => {

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

// Click Duplicate option
const duplicateButton = page.locator(
  'div[role="menuitem"]:has-text("Duplicate")'
);
await duplicateButton.waitFor({ state: 'visible' , timeout: 5000});
await duplicateButton.click();
await page.waitForTimeout(1000);

});