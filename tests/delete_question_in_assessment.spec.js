const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

test('delete question  in draft assessment', async ({ page }) => {
  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open Assessment 
  await page.getByRole('button', { name: 'Assessment' }).click();

  const draftBtn = page.getByRole('button', { name: 'Draft' });

    await draftBtn.waitFor({ state: 'visible' });
    await draftBtn.click();
  
const fullList = page.locator('div.scrollbar-hidden.space-y-4');
await fullList.waitFor({ state: 'visible', timeout: 10000 });

// Locate the first assessment card dynamically
const firstCard = fullList.locator('div:has([data-slot="dropdown-menu-trigger"])').first();

// Wait for the first card to be attached to DOM and visible
await expect(firstCard).toBeVisible({ timeout: 10000 });

// Click the menu button inside the first card
const menuButton = firstCard.locator('[data-slot="dropdown-menu-trigger"]');

await menuButton.click({ force: true });

// Click the "Edit" button (assumes text "Edit" is unique)
const editButton = page.locator('text=Edit').first();
await editButton.click({ force: true });
await page.waitForTimeout(1000);

// Wait for the modal/dialog
  const modal = page.locator('form[role="dialog"]');
  await expect(modal).toBeVisible();


    // Click Save
  const saveButton = modal.locator('button:has-text("Save")');
  await saveButton.click();

// 1️⃣ Click the first question
const firstQuestion = page.locator('div.grid.cursor-pointer').first();
await firstQuestion.waitFor({ state: 'visible', timeout: 5000 });
await firstQuestion.click();

// 2️⃣ Click the menu icon inside the first question
const menuIcon = firstQuestion.locator('svg').first(); // assuming the first SVG is the menu icon
await menuIcon.waitFor({ state: 'visible', timeout: 5000 });
await menuIcon.click();

// Wait for dropdown menu to appear
const deleteButton = page.getByRole('menuitem', { name: 'Delete' });

await deleteButton.waitFor({ state: 'visible' });
await deleteButton.click();

// Wait for confirmation dialog
const deleteDialog = page.getByRole('dialog', { name: 'Delete Question' });
await deleteDialog.waitFor({ state: 'visible' });

// Click "Yes, Delete" button
await deleteDialog.getByRole('button', { name: 'Yes, Delete' }).click();

});
