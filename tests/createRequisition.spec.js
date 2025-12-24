const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

/* ------------------ UTILITIES ------------------ */

// Random string generator
function randomString(min, max) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.trim();
}

// Select random approvers (MIN 1, MAX 5)
async function selectRandomApprovers(dropdown, min = 1, max = 5) {
  await dropdown.waitFor({ state: 'visible' });
  await dropdown.click();

  const options = dropdown.page().getByRole('option');
  await options.first().waitFor({ state: 'visible' });

  const optionCount = await options.count();

  const selectCount = Math.min(
    Math.floor(Math.random() * (max - min + 1)) + min,
    optionCount
  );

  const selectedIndexes = new Set();
  while (selectedIndexes.size < selectCount) {
    selectedIndexes.add(Math.floor(Math.random() * optionCount));
  }

  for (const index of selectedIndexes) {
    await options.nth(index).click();
  }

  await dropdown.page().keyboard.press('Escape');
  console.log(`✅ Selected ${selectCount} approver(s)`);
}

/* ------------------ TEST ------------------ */

test('Go to Settings menu and create Requisition', async ({ page }) => {

  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open Settings
  await page.getByRole('button', { name: 'Settings' }).click();

  // 📌 Go to Requisition tab
  await page.getByRole('button', { name: 'Requisition' }).click();
  console.log('✅ Requisition tab opened');

  // ➕ Click Create Requisition
  await page
    .locator('button[data-slot="button"]', { hasText: 'Requisition' })
    .click();
  console.log('✅ Create Requisition clicked');

  // 📝 Requisition Name (3–50 chars)
  const requisitionName = randomString(3, 50);
  await page.locator('input[name="requisition_name"]').fill(requisitionName);
  console.log(`✅ Requisition Name: ${requisitionName}`);

  // 📝 Description (3–100 chars)
  const description = randomString(3, 100);
  await page.locator('input[name="short_description"]').fill(description);
  console.log(`✅ Description added (${description.length} chars)`);

  // 🔁 Approval Levels
  const TOTAL_LEVELS = 3; // change if needed

  for (let level = 0; level < TOTAL_LEVELS; level++) {
    const dropdown = page.locator('button[role="combobox"]').nth(level);

    // Min 1, Max 5 approvers
    await selectRandomApprovers(dropdown, 1, 5);

    if (level < TOTAL_LEVELS - 1) {
      await page.getByRole('button', { name: /add level/i }).click();
    }

    console.log(`✅ Approval Level ${level + 1} configured`);
  }

  // 💾 Save (if visible)
  const saveButton = page.getByRole('button', { name: /^save$/i });
  if (await saveButton.isVisible()) {
    await saveButton.click();
    console.log('✅ Saved approval configuration');
  }

  // 🚀 Create Requisition
  const createButton = page.locator('button[type="submit"]', {
    hasText: 'Create',
  });

  await createButton.waitFor({ state: 'visible' });
  await createButton.click();

  console.log('🎉 Requisition created successfully!');
});
