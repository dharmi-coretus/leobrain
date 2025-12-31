const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

test('Edit question marks in draft assessment', async ({ page }) => {
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

// 3️⃣ Click the "Edit Marks" button in the dropdown menu
const editMarksButton = page.locator('div[role="menuitem"]', { hasText: 'Edit Marks' });
await editMarksButton.waitFor({ state: 'visible', timeout: 5000 });
await editMarksButton.click();

console.log('✅ First question clicked, menu opened, Edit Marks clicked');


// 1️⃣ Wait for the Edit Marks dialog to appear
const editMarksDialog = page.locator('form[role="dialog"][data-state="open"]');
await editMarksDialog.waitFor({ state: 'visible', timeout: 5000 });

// 1️⃣ Locate the marks input container
const marksContainer = page.locator('div.flex.h-10.rounded-md.border');

// 2️⃣ Wait for it to be visible
await marksContainer.waitFor({ state: 'visible' });

// 3️⃣ Locate the plus button reliably (the button with the "+" SVG path)
const plusButton = marksContainer.locator('button').filter({
  has: page.locator('svg path[d="M14.9994 10.8307H10.8327V14.9974C10.8327 15.2184 10.7449 15.4304 10.5886 15.5867C10.4323 15.7429 10.2204 15.8307 9.99935 15.8307C9.77834 15.8307 9.56637 15.7429 9.41009 15.5867C9.25381 15.4304 9.16602 15.2184 9.16602 14.9974V10.8307H4.99935C4.77834 10.8307 4.56637 10.7429 4.41009 10.5867C4.25381 10.4304 4.16602 10.2184 4.16602 9.9974C4.16602 9.77638 4.25381 9.56442 4.41009 9.40814C4.56637 9.25186 4.77834 9.16406 4.99935 9.16406H9.16602V4.9974C9.16602 4.77638 9.25381 4.56442 9.41009 4.40814C9.56637 4.25186 9.77834 4.16406 9.99935 4.16406C10.2204 4.16406 10.4323 4.25186 10.5886 4.40814C10.7449 4.56442 10.8327 4.77638 10.8327 4.9974V9.16406H14.9994C15.2204 9.16406 15.4323 9.25186 15.5886 9.40814C15.7449 9.56442 15.8327 9.77638 15.8327 9.9974C15.8327 10.2184 15.7449 10.4304 15.5886 10.5867C15.4323 10.7429 15.2204 10.8307 14.9994 10.8307Z"]')
});

// 4️⃣ Generate random number between 1 and 10
const randomClicks = Math.floor(Math.random() * 10) + 1;

// 5️⃣ Click plus button 'randomClicks' times with small delay
for (let i = 0; i < randomClicks; i++) {
  await plusButton.click();
  await page.waitForTimeout(150); // small delay
}

// 6️⃣ Optional: verify the input value
const marksInput = marksContainer.locator('input[name="marks"]');
console.log(`Marks set: ${await marksInput.inputValue()}`);



// 5️⃣ Click Save button to confirm
const saveButton2 = editMarksDialog.locator('button[type="submit"]', { hasText: 'Save' });
await saveButton2.click();
await page.waitForTimeout(1000);


});