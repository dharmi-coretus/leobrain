const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

// Utility to generate random string
function randomString(minLength = 5, maxLength = 50) {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
    let str = '';
    for (let i = 0; i < length; i++) str += chars.charAt(Math.floor(Math.random() * chars.length));
    return str.trim();
}


// ----------------- Test -----------------
test('Edit library question with random text and type', async ({ page }) => {
    await signIn(page);

    await page.getByRole('button', { name: 'Library' }).click();
    await page.getByRole('button', { name: 'My Library' }).click();

    const firstLibraryCard = page.locator('div.space-y-5 > div.cursor-pointer').first();
    await firstLibraryCard.click();
    await page.waitForLoadState('networkidle');

    // 1️⃣ Locate the first question card
    const firstQuestionCard = page.locator('div.grid.cursor-pointer').first();
    await firstQuestionCard.scrollIntoViewIfNeeded();
    await expect(firstQuestionCard).toBeVisible();
    await firstQuestionCard.click();

    // 2️⃣ Click the 3-dot menu button inside the first card
    const menuButton = firstQuestionCard.locator('button[aria-haspopup="menu"]');
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // 3️⃣ Wait for dropdown menu and click Edit
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await menu.getByRole('menuitem', { name: 'Edit' }).click();

   // Wait for modal to appear
    const modal = page.locator('div[role="dialog"]');
    await modal.waitFor({ state: 'visible' });

    // --- Edit Question ---
    const questionInput = modal.locator('input[name="question"]');
    await questionInput.fill(randomString(20, 100));

   await page.getByRole('combobox', { name: 'Type' }).click();
  await page.getByRole('option', { name: type }).click();
});
