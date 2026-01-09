// tests/deleteCompany.spec.js
const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

test('Go to Settings menu and delete Company with multiple locations', async ({ page }) => {
  // Step 1: Sign in
  await signIn(page);
  await page.waitForTimeout(1000);

  // Step 2: Open Settings
  const settingsButton = page.locator('button:has-text("Settings")');
  await settingsButton.waitFor({ state: 'visible' });
  await settingsButton.scrollIntoViewIfNeeded();
  await settingsButton.click();
  await page.waitForTimeout(1000);

  // Step 3: Locate first company
  const firstCompany = page.locator('div[data-slot="accordion-item"]').first();
  await firstCompany.waitFor({ state: 'visible' });
  await firstCompany.scrollIntoViewIfNeeded();

  // Step 4: Hover to reveal action buttons
  await firstCompany.hover();

  // Step 5: Click DELETE button (second hover-card-trigger)
  const deleteButton = firstCompany
    .locator('div[data-slot="hover-card-trigger"]')
    .nth(1); // 0 = Edit, 1 = Delete

  await deleteButton.waitFor({ state: 'visible' });
  await deleteButton.click();

  console.log('🗑️ Delete button clicked for first company');

  // Wait for delete confirmation dialog
const deleteDialog = page.locator('div[role="dialog"]');
await deleteDialog.waitFor({ state: 'visible' });

// Click "Yes, Delete" button inside dialog
const yesDeleteButton = deleteDialog.getByRole('button', { name: 'Yes, Delete' });
await yesDeleteButton.waitFor({ state: 'visible' });
await yesDeleteButton.click();
 await page.waitForTimeout(1000);
console.log('✅ Confirmed company deletion');

});
