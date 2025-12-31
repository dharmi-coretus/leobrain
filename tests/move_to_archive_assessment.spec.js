const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

test('Move to archive assessment', async ({ page }) => {
  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open assessment
  await page.getByRole('button', { name: 'Assessment' }).click();

  const inuseBtn = page.getByRole('button', { name: 'In Use' });

    await inuseBtn.waitFor({ state: 'visible' });
    await inuseBtn.click();

  // Select the first card (escaped Tailwind class)
  const firstCard = page.locator('div.cursor-pointer.rounded-\\[12px\\]').first();

  // Click on the three-dot menu inside the first card
  const menuButton = firstCard.locator('button[data-slot="dropdown-menu-trigger"]');
  await menuButton.click();

 // 1️⃣ Wait for the menu item to be visible
const archiveButton = page.locator('div[role="menuitem"]', { hasText: 'Archive' });
await archiveButton.waitFor({ state: 'visible', timeout: 5000 });

// 2️⃣ Click the Archive button
await archiveButton.click();

console.log('✅ Archive button clicked');

// 1️⃣ Wait for the confirmation dialog to appear
const confirmationDialog = page.locator('div[role="dialog"]:has-text("Move to Archived")');
await confirmationDialog.waitFor({ state: 'visible', timeout: 5000 });

// 2️⃣ Locate the "Yes" button inside the dialog
const yesButton = confirmationDialog.locator('button', { hasText: 'Yes' });

// 3️⃣ Click the "Yes" button
await yesButton.click();

console.log('✅ "Yes" button clicked, assessment moved to archived');

});