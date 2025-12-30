const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();
// ---------- TEST ----------
test('Edit screening question in template ', async ({ page }) => {
  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open Templates
  await page.getByRole('button', { name: 'Templates' }).click();
  const screeningQuestionsBtn = page.locator('button', { hasText: 'Screening Questions' });
  await screeningQuestionsBtn.waitFor({ state: 'visible' });
  await screeningQuestionsBtn.click();

    // Target first template card
const firstTemplateCard = page
  .locator('div.cursor-pointer.rounded-\\[12px\\]')
  .first();

// Click action (3-dot) menu
const actionButton = firstTemplateCard.locator(
  'button[data-slot="dropdown-menu-trigger"]'
);
await actionButton.waitFor({ state: 'visible' });
await actionButton.click();

// Click Edit option
const editButton = page.locator(
  'div[role="menuitem"]:has-text("Edit")'
);
await editButton.waitFor({ state: 'visible' });
await editButton.click();


/* ---------- SAVE ---------- */

  const saveButton = page.locator(
    'button[data-slot="button"]:has-text("Save")'
  );
  await saveButton.waitFor({ state: 'visible', timeout: 5000 });
  await saveButton.click();

  console.log('✅ Template edited & saved successfully');

   
// Target the first card
const firstCard = page.locator('.bg-sub-background.rounded-\\[10px\\].border').first();

// Wait for it to be visible
await firstCard.waitFor({ state: 'visible' });

// Click the menu button inside the first card
await firstCard.locator('button[data-slot="dropdown-menu-trigger"]').click();

// Wait for the dropdown menu to appear and click the "Edit" option
await page.locator('div[role="menuitem"]:has-text("Edit")').click();

 
// 1️⃣ Auto scroll to top
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
});