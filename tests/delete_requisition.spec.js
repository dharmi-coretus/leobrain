const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();


test('Delete requisition', async ({ page }) => {

// 🔐 Sign in
  await signIn(page);

  // ⚙️ Open Settings
  await page.getByRole('button', { name: 'Settings' }).click();

  // 📌 Go to Requisition tab
  await page.getByRole('button', { name: 'Requisition' }).click();
  console.log('✅ Requisition tab opened');

// Target the first requisition card
const firstRequisitionItem = page
  .locator('div[data-slot="accordion-item"]')
  .first();

// Ensure it is visible
await firstRequisitionItem.waitFor({ state: 'visible' });

// Hover to reveal action buttons
await firstRequisitionItem.hover();

// Click the SECOND hover action button → Delete
const deleteButton = firstRequisitionItem
  .locator('div.ml-auto div[data-slot="hover-card-trigger"]')
  .nth(1); // second button

await deleteButton.waitFor({ state: 'visible' });
await deleteButton.click();

console.log('✅ Delete button clicked for first requisition');

// ---------- CONFIRM DELETE ----------
const confirmDeleteButton = page.getByRole('button', { name: /yes/i });
await confirmDeleteButton.waitFor({ state: 'visible' });
await confirmDeleteButton.click();

console.log('🎉 First requisition deleted successfully');

});