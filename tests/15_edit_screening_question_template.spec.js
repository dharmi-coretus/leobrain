const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

function randomString(min = 3, max = 30) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}

function getRandomDescription(min = 3, max = 100) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('').trim();
}
// ---------- TEST ----------
test('Edit screening question template ', async ({ page }) => {
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


  /* ---------- EDIT TEMPLATE FORM ---------- */

  const updatedName = randomString();
  const updatedDescription = getRandomDescription();

  // 📝 Update Name
  const nameInput = page.locator('input[name="name"]');
  await nameInput.waitFor({ state: 'visible', timeout: 5000 });
  await nameInput.fill('');
  await nameInput.fill(updatedName);

  console.log('✅ Updated Name:', updatedName);

  // 📝 Update Description
  const descriptionInput = page.locator('input[name="description"]').first();
  await descriptionInput.fill('');
  await descriptionInput.fill(updatedDescription);

  console.log('✅ Updated Description');

  /* ---------- SAVE ---------- */

  const saveButton = page.locator(
    'button[data-slot="button"]:has-text("Save")'
  );
  await saveButton.waitFor({ state: 'visible', timeout: 5000 });
  await saveButton.click();

  console.log('✅ Template edited & saved successfully');


});