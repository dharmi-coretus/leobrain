const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

test('Create Library - Add import Multiple Question Types', async ({ page }) => {
  await signIn(page);

  await page.getByRole('button', { name: 'Library' }).click();
  await page.getByRole('button', { name: 'My Library' }).click();

  const firstLibraryCard = page.locator('div.space-y-5 > div.cursor-pointer').first();
  await firstLibraryCard.click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Question' }).first().click();

  // Using role + name if accessible
await page.getByRole('button', { name: 'Import' }).click();

// Or using a more precise locator with SVG inside
const importButton = page.locator('button:has-text("Import")');
await importButton.scrollIntoViewIfNeeded();
await importButton.click({ force: true });

// Locate the hidden file input
const fileInput = page.locator('input#question_file');

// Set the file (from your fixtures folder, e.g., tests/fixtures/questions.csv)
await fileInput.setInputFiles('tests/fixtures/importquestion.csv');

// Optional: Wait a bit if the UI shows a preview or success message
  await page.waitForLoadState('networkidle');


  // After clicking the Submit button for import
await page.getByRole('button', { name: 'Submit' }).click();

// Wait for the "Importing File" dialog to appear
// Locator for the "Importing File" popup specifically
const importDialog = page.locator('div[role="dialog"] >> text=Importing File');

// Wait until the dialog disappears (file import complete)
await importDialog.waitFor({ state: 'hidden', timeout: 60000 }); // 60s max

// Now you can continue safely with next actions
console.log('File import completed');

const selectAllCheckbox = page.locator('button[role="checkbox"]').first();
const isChecked = await selectAllCheckbox.getAttribute('aria-checked');

if (isChecked === 'false') {
  await selectAllCheckbox.click();
  await page.waitForTimeout(1000);
}

// Locate the "Add to Library" button by text
const addToLibraryButton = page.getByRole('button', { name: 'Add to Library' });

// Click the button
await addToLibraryButton.click();
await page.waitForTimeout(6000);
});