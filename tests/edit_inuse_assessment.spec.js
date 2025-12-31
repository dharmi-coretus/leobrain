const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

test('Edit in use assessment', async ({ page }) => {
  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open assessment
  await page.getByRole('button', { name: 'Assessment' }).click();

  const inuseBtn = page.getByRole('button', { name: 'In Use' });

    await inuseBtn.waitFor({ state: 'visible' });
    await inuseBtn.click();
// Wait for the container with all cards to be visible
const fullList = page.locator('div.scrollbar-hidden.space-y-4');
await fullList.waitFor({ state: 'visible', timeout: 10000 });

// Locate the first card dynamically
const firstCard = fullList.locator('div.cursor-pointer.rounded-[12px]').first();

// Wait for the first card to be visible
await expect(firstCard).toBeVisible({ timeout: 10000 });

// Click the dropdown/menu button inside the first card
const menuButton = firstCard.locator('[data-slot="dropdown-menu-trigger"]');
await menuButton.click({ force: true });

// Click the "Edit" button in the dropdown
const editButton = page.locator('text=Edit').first();
await editButton.click({ force: true });
await page.waitForTimeout(1000);

// Wait for the modal/dialog to appear
const modal = page.locator('form[role="dialog"]');
await expect(modal).toBeVisible();

});