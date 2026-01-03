const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();


test('Career page step-3 remove and change image', async ({ page }) => {
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

await page.waitForLoadState('networkidle');
await page.evaluate(() => {
  window.scrollBy(0, window.innerHeight);
});
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

// Add Images section
const addImagesSection = page
  .locator('div.grid.w-full.grid-cols-1.px-5.pt-8.pb-15')
  .filter({ hasText: 'Add Images' })
  .first();

await addImagesSection.scrollIntoViewIfNeeded();
await expect(addImagesSection).toBeVisible();

// First image card
const firstImageCard = addImagesSection
  .locator('div.group.relative.h-\\[88px\\].w-\\[160px\\]')
  .first();

await firstImageCard.hover();

// Delete button
const deleteButton = firstImageCard.locator('button:has-text("Delete")');
await expect(deleteButton).toBeVisible();
await deleteButton.click();
await page.waitForTimeout(3000);
console.log('✅ Image deleted successfully');

// Hover first card
await firstImageCard.hover();

// Change image
const changeFileInput = firstImageCard.locator(
  'label:has-text("Change") input[type="file"]'
);

await expect(changeFileInput).toBeAttached();

await changeFileInput.setInputFiles(
  'tests/fixtures/career2.jpg'
);
await page.waitForTimeout(3000);
console.log('✅ Image changed successfully');



const benefitsSection = page
  .locator('div')
  .filter({ has: page.locator('label', { hasText: 'Benefits' }) })
  .first();

await expect(benefitsSection).toBeVisible();
const benefitChips = benefitsSection.locator(
  'div.mt-2.flex.flex-wrap.gap-2 > div'
);

await expect(benefitChips.first()).toBeVisible();
const firstBenefit = benefitChips.first();

// Optional hover (UI feedback)
await firstBenefit.hover();

// Click remove (X) button
await firstBenefit.locator('button').click();

console.log('✅ First benefit removed successfully');

// 1️⃣ Open the dropdown
const benefitsDropdown = page.locator('button[role="combobox"][data-slot="popover-trigger"]');
await benefitsDropdown.click();

// 2️⃣ Wait for the popover content
const popover = page.locator('div[role="dialog"][data-slot="popover-content"]');
await popover.waitFor({ state: 'visible', timeout: 5000 });

// 3️⃣ Select all benefit items (buttons acting as checkboxes)
const benefitItems = popover.locator('div[data-slot="command-item"] button[role="checkbox"]');
const count = await benefitItems.count();

// 4️⃣ Decide how many random benefits to select
const numberToSelect = Math.min(3, count); // up to 3 random
const selectedIndexes = new Set();

// 5️⃣ Pick unique random indexes
while (selectedIndexes.size < numberToSelect) {
  const randomIndex = Math.floor(Math.random() * count);
  selectedIndexes.add(randomIndex);
}

// 6️⃣ Click the random checkboxes
for (const index of selectedIndexes) {
  const checkbox = benefitItems.nth(index);
  
  // Only click if not already selected
  const isChecked = await checkbox.getAttribute('aria-checked');
  if (isChecked !== 'true') {
    await checkbox.click();
    console.log(`Selected benefit #${index + 1}`);
  } else {
    console.log(`Benefit #${index + 1} already selected, skipping`);
  }
}

// ✅ Optional: close dropdown
await benefitsDropdown.press('Escape');
await page.waitForTimeout(500);
console.log('Random benefits selected successfully ✅');

// Digital Presence section
const digitalPresenceSection = page
  .locator('div')
  .filter({
    has: page.locator('h3', { hasText: 'Digital Presence' })
  })
  .first();

await expect(digitalPresenceSection).toBeVisible();

// All preference rows
const digitalRows = digitalPresenceSection.locator(
  'div.grid.grid-cols-\\[1fr_auto\\].space-y-3.px-5'
);

// ✅ FIX HERE
const rowCount = await digitalRows.count();
expect(rowCount).toBeGreaterThan(1);

// Second preference
const secondPreference = digitalRows.nth(1);
await secondPreference.scrollIntoViewIfNeeded();
await secondPreference.hover();

// Delete button
await secondPreference
  .locator('div[data-slot="hover-card-trigger"]')
  .click();
await page.waitForTimeout(1000);
console.log('✅ Second digital preference deleted');


// Click the Publish button
const publishBtn = page.locator('button[type="submit"]', { hasText: 'Publish' });
await publishBtn.click();

await page.waitForTimeout(4000);
console.log('Clicked on Publish button');
// Wait for UI to stabilize after uploads
await page.waitForLoadState('networkidle');
});