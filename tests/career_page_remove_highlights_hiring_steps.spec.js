const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();


test('Career page step-2 Remove highlights and remove hiring steps', async ({ page }) => {
  await signIn(page);

  await page.getByRole('button', { name: 'Apps' }).click();

  const editButton = page.locator(
  'button:has(svg path[d*="10.8332"])'
);

await editButton.waitFor({ state: 'visible' });
await editButton.click();

await page.waitForLoadState('networkidle');
await page.evaluate(() => {
  window.scrollBy(0, window.innerHeight);
});
// Locate the Next button by data attribute
const nextButton = page.locator('button[data-slot="button"]', { hasText: 'Next' });

// Ensure it's visible and enabled
await expect(nextButton).toBeVisible();
await expect(nextButton).toBeEnabled();

// Click the Next button
await nextButton.click();

await page.waitForTimeout(1000);

// 1️⃣ Get all highlight cards
const highlightCards = page.locator(
  'div.flex.w-full.items-center'
);

// Ensure at least one card exists
await expect(highlightCards.first()).toBeVisible();

// 2️⃣ Focus on the FIRST card
const firstCard = highlightCards.first();
await firstCard.scrollIntoViewIfNeeded();

// 3️⃣ Locate delete button INSIDE first card
const deleteBtn = firstCard.locator(
  'button:has(svg path[d*="L6.32199 16.7067"])'
);

// 4️⃣ Click delete
await deleteBtn.click();
await page.waitForTimeout(2000);
console.log('Deleted first highlight card');



// Scope to Steps section only
const stepsSection = page.locator('div', { hasText: 'Steps' });

// Steps container
const stepsContainer = stepsSection.locator(
  'div.grid.w-full.grid-cols-1.px-5.pt-8.pb-15'
);

await expect(stepsContainer.first()).toBeVisible();

// Step cards
const stepCards = stepsContainer.locator(
  'div.flex.w-full.items-center.gap-4.transition-opacity'
);

const firstStep = stepCards.first();
await firstStep.scrollIntoViewIfNeeded();

// Delete button
await firstStep.locator('button:has(svg)').click();
await page.waitForTimeout(3000);
console.log('Deleted first hiring process step card');


// Locate the "Next" button by text
const nextButton2 = page.locator('button[data-slot="button"]', { hasText: 'Next' });

// Wait for it to be visible and enabled
await expect(nextButton2).toBeVisible();
await expect(nextButton2).toBeEnabled();

// Click the button
await nextButton2.click();
// Wait for page to be stable
await page.waitForTimeout(3000);
console.log('Clicked on Next button ✅');


});