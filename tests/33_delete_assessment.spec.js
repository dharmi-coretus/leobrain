const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

test('Delete assessment', async ({ page }) => {
  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open assessment 
  await page.getByRole('button', { name: 'Assessment' }).click();

  const draftBtn = page.getByRole('button', { name: 'Draft' });

    await draftBtn.waitFor({ state: 'visible' });
    await draftBtn.click();
  
const fullList = page.locator('div.scrollbar-hidden.space-y-4');
await fullList.waitFor({ state: 'visible', timeout: 10000 });

// Locate the first assessment card dynamically
const firstCard = fullList.locator('div:has([data-slot="dropdown-menu-trigger"])').first();

// Wait for the first card to be attached to DOM and visible
await expect(firstCard).toBeVisible({ timeout: 10000 });

// Click the menu button inside the first card
const menuButton = firstCard.locator('[data-slot="dropdown-menu-trigger"]');
await menuButton.click({ force: true });

// Click the "Edit" button (assumes text "Edit" is unique)
const editButton = page.locator('text=Delete').first();
await editButton.click({ force: true });
await page.waitForTimeout(1000);

// Wait for the Delete Assessment dialog to appear
const deleteDialog = page.locator('div[role="dialog"]:has-text("Delete Assessment")');
await deleteDialog.waitFor({ state: 'visible', timeout: 5000 });

// Click the "Yes, Delete" button
await deleteDialog.locator('button:has-text("Yes, Delete")').click();

// Optionally, wait for the dialog to disappear
await deleteDialog.waitFor({ state: 'hidden', timeout: 5000 });

});