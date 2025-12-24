const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();


// ---------- UTILS ----------
function randomString(min, max) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.random().toString(36).substring(2, 2 + length);
}

// ---------- SELECT RANDOM APPROVERS ----------
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



test('Go to Settings menu and Edit Requisition', async ({ page }) => {

// 🔐 Sign in
  await signIn(page);

  // ⚙️ Open Settings
  await page.getByRole('button', { name: 'Settings' }).click();

  // 📌 Go to Requisition tab
  await page.getByRole('button', { name: 'Requisition' }).click();
  console.log('✅ Requisition tab opened');


// Target first requisition card
const firstRequisitionItem = page
  .locator('div[data-slot="accordion-item"]')
  .first();

// Ensure it is visible
await firstRequisitionItem.waitFor({ state: 'visible' });

// Hover to reveal action buttons
await firstRequisitionItem.hover();

// Click the FIRST hover action button → Edit
const editButton = firstRequisitionItem
  .locator('div[data-slot="hover-card-trigger"]')
  .first();

await editButton.waitFor({ state: 'visible' });
await editButton.click();

console.log('✅ Edit button clicked for first requisition');



// ---------- WAIT FOR EDIT MODAL ----------
const editModal = page.locator('[role="dialog"]:has-text("Edit Requisition")');
await editModal.waitFor({ state: 'visible' });

// ---------- UPDATE REQUISITION NAME ----------
const newName = randomString(3, 50);
const nameInput = editModal.locator('input[name="requisition_name"]');

await nameInput.fill('');
await nameInput.fill(newName);
console.log(`✅ Updated Requisition Name: ${newName}`);

// ---------- UPDATE DESCRIPTION ----------
const newDescription = randomString(3, 100);
const descriptionInput = editModal.locator('input[name="short_description"]');

await descriptionInput.fill('');
await descriptionInput.fill(newDescription);
console.log(`✅ Updated Description`);

// ---------- APPROVAL LEVELS ----------
const TOTAL_LEVELS = Math.floor(Math.random() * 3) + 1; // 1–3 levels

for (let level = 0; level < TOTAL_LEVELS; level++) {
  const dropdown = editModal
    .locator('button[role="combobox"]')
    .nth(level);

  await selectRandomApprovers(dropdown, 1, 5);

  // Add next level if needed
  if (level < TOTAL_LEVELS - 1) {
    const addLevelBtn = editModal.getByRole('button', { name: /add level/i });
    await addLevelBtn.click();
  }

  console.log(`✅ Level ${level + 1} updated`);
}



// ---------- SAVE ----------
const saveButton = editModal.getByRole('button', { name: /^save$/i });
await saveButton.waitFor({ state: 'visible' });
await saveButton.click();

console.log('🎉 Requisition updated successfully');


});