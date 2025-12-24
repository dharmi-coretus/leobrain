const { test } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

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

// ---------- ADD NEW LEVEL ----------
async function addNewApprovalLevel(editModal, min = 1, max = 5) {
  const addLevelBtn = editModal.locator('button:has-text("Add Level")');
  await addLevelBtn.waitFor({ state: 'visible' });
  await addLevelBtn.click();
  console.log('✅ "Add Level" button clicked');

  const newDropdown = editModal.locator('button[role="combobox"]').last();
  await newDropdown.waitFor({ state: 'visible' });

  await selectRandomApprovers(newDropdown, min, max);
  console.log('✅ New level added with random approvers');
}

test('Add new requisition approval level', async ({ page }) => {
  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open Settings -> Requisition
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Requisition' }).click();
  console.log('✅ Requisition tab opened');

  // Target first requisition card and click Edit
  const firstRequisitionItem = page.locator('div[data-slot="accordion-item"]').first();
  await firstRequisitionItem.waitFor({ state: 'visible' });
  await firstRequisitionItem.hover();

  const editButton = firstRequisitionItem.locator('div[data-slot="hover-card-trigger"]').first();
  await editButton.waitFor({ state: 'visible' });
  await editButton.click();
  console.log('✅ Edit button clicked for first requisition');

  // Wait for edit modal
  const editModal = page.locator('[role="dialog"]:has-text("Edit Requisition")');
  await editModal.waitFor({ state: 'visible' });

  // Add new approval level
  await addNewApprovalLevel(editModal, 1, 5);



// ---------- DELETE FIRST LEVEL ----------
const firstLevelDeleteBtn = editModal.locator('div.col-span-2 div.flex.gap-1 div.cursor-pointer svg').first();
await firstLevelDeleteBtn.waitFor({ state: 'visible' });
await firstLevelDeleteBtn.click();
console.log('✅ Delete button clicked for first level');

 // ---------- CONFIRM DELETE ----------
  const confirmDeleteBtn = page.getByRole('button', { name: /yes/i });
  await confirmDeleteBtn.waitFor({ state: 'visible' });
  await confirmDeleteBtn.click();
  console.log('✅ Level deleted successfully');

  // Save changes
  const saveButton = editModal.getByRole('button', { name: /^save$/i });
  await saveButton.waitFor({ state: 'visible' });
  await saveButton.click();
  console.log('🎉 New approval level added and saved successfully');
});
