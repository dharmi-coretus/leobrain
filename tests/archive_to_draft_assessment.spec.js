const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

test('Move assessment - archive to draft', async ({ page }) => {
  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open Assessment 
  await page.getByRole('button', { name: 'Assessment' }).click();

  const archiveBtn = page.getByRole('button', { name: 'Archive' });

    await archiveBtn.waitFor({ state: 'visible' });
    await archiveBtn.click();

    const firstAssessmentCard = page
  .locator('div.cursor-pointer.rounded-\\[12px\\]')
  .first();

await firstAssessmentCard.waitFor({ state: 'visible' });
await firstAssessmentCard.click();

await page.getByRole('button', { name: 'Move to Draft' }).click();

// Wait for Move To Draft confirmation dialog
const dialog = page.getByRole('dialog', { name: 'Move To Draft' });
await dialog.waitFor({ state: 'visible' });

// Click Yes button inside the dialog
await dialog.getByRole('button', { name: 'Yes' }).click();
});