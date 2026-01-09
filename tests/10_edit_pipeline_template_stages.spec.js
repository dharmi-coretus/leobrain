const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();
function getRandomStageName(min = 3, max = 30) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.trim();
}
function getRandomDescription(min = 3, max = 100) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.trim();
}

// ---------- TEST ----------
test('Go to template menu and edit pipeline template with interview and assessment stage', async ({ page }) => {

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


  // ---------- EDIT FIRST STAGE ----------

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

// 3️⃣ Click "Edit" from dropdown
const editStageButton = page.locator(
  'div[role="menuitem"]:has-text("Edit")'
);

await editStageButton.waitFor({ state: 'visible', timeout: 5000 });
await editStageButton.click();

// ---------- AFTER CLICK ON EDIT BUTTON ----------

// 1️⃣ Auto scroll to top
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);

// Target stage name input (EDIT MODE)
const stageNameInput = page.locator('input[name="stage_name"]');

// Wait until visible
await stageNameInput.waitFor({ state: 'visible', timeout: 5000 });

// Clear existing value
await stageNameInput.fill('');

// Enter new random stage name
const newStageName = getRandomStageName(3, 30);
await stageNameInput.fill(newStageName);

console.log(`✅ Stage name updated to: ${newStageName}`);


// Target description input
const descriptionInput = page.locator('input[name="description"]');

// Wait until visible
await descriptionInput.waitFor({ state: 'visible', timeout: 5000 });

// Clear existing value
await descriptionInput.fill('');

// Enter random description (3–100 chars)
const newDescription = getRandomDescription(3, 100);
await descriptionInput.fill(newDescription);

console.log(`✅ Description updated to: ${newDescription}`);

// Locators for radio buttons
const interviewRadio = page.locator('button[role="radio"][value="Interview"]');
const assessmentRadio = page.locator('button[role="radio"][value="Assessment"]');

// Ensure radio group is visible
await interviewRadio.first().waitFor({ state: 'visible', timeout: 5000 });

// Read current state
const isInterviewSelected = await interviewRadio.getAttribute('aria-checked') === 'true';
const isAssessmentSelected = await assessmentRadio.getAttribute('aria-checked') === 'true';

// Toggle logic
if (isInterviewSelected) {
  await assessmentRadio.click();
  console.log('🔄 Type changed: Interview → Assessment');
} else if (isAssessmentSelected) {
  await interviewRadio.click();
  console.log('🔄 Type changed: Assessment → Interview');
} else {
  throw new Error('❌ No stage type is selected');
}


// ---------- SAVE STAGE ----------

// 4️⃣ Click stage-level Save button
const stageSaveButton = page.locator(
  'button[type="submit"][data-slot="button"]:has-text("Save")'
);

await stageSaveButton.waitFor({ state: 'visible', timeout: 5000 });
await stageSaveButton.click();

await page.waitForTimeout(800);

// ---------- FINAL TEMPLATE SAVE ----------

// 5️⃣ Click final Save button
const finalSaveButton = page.locator(
  'button[type="button"][data-slot="button"]:has-text("Save")'
);

await finalSaveButton.waitFor({ state: 'visible', timeout: 5000 });
await finalSaveButton.click();

console.log('✅ Stage edited and template saved successfully');
});