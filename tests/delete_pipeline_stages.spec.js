const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();
// ---------- TEST ----------
test('Go to template menu and delete pipeline stage', async ({ page }) => {

  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open Templates
  await page.getByRole('button', { name: 'Templates' }).click();

  const pipelineButton = page.locator('button', { hasText: 'Pipeline' });
  await pipelineButton.waitFor({ state: 'visible' });
  await pipelineButton.click();

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


  // ---------- DELETE FIRST STAGE ----------

// 1️⃣ Locate the FIRST stage card
const firstStageCard = page
  .locator('div[draggable="true"].border-stroke')
  .first();

await firstStageCard.waitFor({ state: 'visible', timeout: 5000 });

// 2️⃣ Click the 3-dot action (dropdown) button inside first stage
const stageActionButton = firstStageCard.locator(
  'button[data-slot="dropdown-menu-trigger"]'
);

await stageActionButton.click();

// 2️⃣ Click Delete option
const deleteMenuItem = page.locator(
  'div[role="menuitem"].text-destructive',
  { hasText: 'Delete' }
);

await deleteMenuItem.waitFor({ state: 'visible', timeout: 5000 });
await deleteMenuItem.click();

console.log('🗑️ Delete button clicked successfully');

// 1️⃣ Wait for Delete confirmation dialog to appear
const deleteDialog = page.locator('div[role="dialog"]', {
  hasText: 'Delete Stage'
});

await deleteDialog.waitFor({ state: 'visible', timeout: 5000 });

// 2️⃣ Click "Yes, Delete" button inside dialog
const confirmDeleteButton = deleteDialog.locator(
  'button',
  { hasText: 'Yes, Delete' }
);

await confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
await confirmDeleteButton.click();

await page.waitForTimeout(1000);

console.log('✅ Stage deleted successfully');

// ---------- FINAL TEMPLATE SAVE ----------

// 5️⃣ Click final Save button
const finalSaveButton = page.locator(
  'button[type="button"][data-slot="button"]:has-text("Save")'
);

await finalSaveButton.waitFor({ state: 'visible', timeout: 5000 });
await finalSaveButton.click();
await page.waitForTimeout(1000);
console.log('✅ Stage edited and template saved successfully');

});