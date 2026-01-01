const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

// Utility: generate random string 5–50 chars
function randomCoreStatement(minLength = 5, maxLength = 50) {
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.trim();
}


function randomString2(minLength = 10, maxLength = 150) {
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Trim to avoid starting/ending with space
  return result.trim();
}


/* ---------------- TEST ---------------- */
test('Create career page', async ({ page }) => {
  await signIn(page);

  await page.getByRole('button', { name: 'Apps' }).click();

  const editButton = page.locator(
  'button:has(svg path[d*="10.8332"])'
);

await editButton.waitFor({ state: 'visible' });
await editButton.click();


const { test, expect } = require('@playwright/test');
const path = require('path');



// ---------------- Company Logo ----------------
const companyLogoInput = page.locator('#logo'); // Company logo input
const companyChangeButton = page.locator('p.text-primary', { hasText: 'Change' }).filter({
  has: page.locator('label', { hasText: 'Company Logo' })
});

// Click "Change" if visible
if (await companyChangeButton.isVisible()) {
  await companyChangeButton.click();
}

// Upload new company logo
await companyLogoInput.setInputFiles(path.resolve(__dirname, 'fixtures/logo.png'));
console.log('Company logo uploaded');

// ---------------- Featured Image ----------------
const featuredLogoInput = page.locator('#featured_image'); // Featured image input
const featuredChangeButton = page.locator('p.text-primary', { hasText: 'Change' }).filter({
  has: page.locator('label', { hasText: 'Featured Image' })
});

// Click "Change" if visible
if (await featuredChangeButton.isVisible()) {
  await featuredChangeButton.click();
}

// Upload new featured image
await featuredLogoInput.setInputFiles(path.resolve(__dirname, 'fixtures/featured.png'));
console.log('Featured image uploaded');

// Optional wait for UI updates
await page.waitForTimeout(2000);

 

});