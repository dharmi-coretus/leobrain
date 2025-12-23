// tests/editCompany.spec.js
const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

test('Go to Settings menu and Edit Company with multiple locations', async ({ page }) => {
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

  // Step 5: Click Edit button (FIRST button)
  const editButton = firstCompany
    .locator('div[data-slot="hover-card-trigger"]')
    .first(); // ✅ Edit button

  await editButton.waitFor({ state: 'visible' });
  await editButton.click();

  console.log('✅ Clicked Edit button for the first company');

  await page.waitForTimeout(1000);

  // 🔜 Next steps:
  // - Edit company name
  // - Edit / add / remove locations
  // - Click Save / Update
});
