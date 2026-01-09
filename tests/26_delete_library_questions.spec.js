const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

/* ---------------- TEST ---------------- */
test('Delete library questions', async ({ page }) => {
  await signIn(page);

  await page.getByRole('button', { name: 'Library' }).click();
  await page.getByRole('button', { name: 'My Library' }).click();

  await page.locator('div.space-y-5 > div.cursor-pointer').first().click();
  await page.waitForLoadState('networkidle');

  const questionCard = page.locator('div.grid.cursor-pointer').first();
  await questionCard.click();

  await questionCard.locator('button[aria-haspopup="menu"]').click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();

  // Confirm delete
const deleteDialog = page.locator('div[role="dialog"]', {
  hasText: 'Delete Question'
});
await deleteDialog.waitFor({ state: 'visible' });
await deleteDialog.getByRole('button', { name: 'Yes, Delete' }).click();



});