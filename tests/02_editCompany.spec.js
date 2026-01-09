// tests/editCompany.spec.js
const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

test('Go to Settings menu and Edit Company with multiple locations', async ({ page }) => {
  // Step 1: Sign in
  await signIn(page);
  await page.waitForTimeout(1000);

  // Step 2: Open Settings
  const settingsButton = page.locator('button:has-text("Settings")');
  await settingsButton.waitFor({ state: 'visible' });
  await settingsButton.scrollIntoViewIfNeeded();
  await settingsButton.click();
  await page.waitForTimeout(1000);

  // Step 3: Locate first company
  const firstCompany = page.locator('div[data-slot="accordion-item"]').first();
  await firstCompany.waitFor({ state: 'visible' });
  await firstCompany.scrollIntoViewIfNeeded();

  // Step 4: Hover to reveal action buttons
  await firstCompany.hover();

  // Step 5: Click Edit button (FIRST button)
  const editButton = firstCompany
    .locator('div[data-slot="hover-card-trigger"]')
    .first(); // ✅ Edit button

  await editButton.waitFor({ state: 'visible' });
  await editButton.click();

  console.log('✅ Clicked Edit button for the first company');

  await page.waitForTimeout(1000);

  // 🔜 Next steps:
  // - Edit company name
  // - Edit / add / remove locations
  // - Click Save / Update
  
// ===============================
// STEP 1: Click "Change" (Logo)
// ===============================
const changeLogoButton = page.locator('p:text("Change")').first();

await changeLogoButton.waitFor({ state: 'visible' });
await changeLogoButton.click();
console.log('✅ Change logo clicked');

// ===============================
// STEP 2: Upload New Logo
// ===============================
const logoInput = page.locator('input[type="file"]').first();
await logoInput.setInputFiles('tests/fixtures/new-logo.png');
console.log('✅ New logo file uploaded');

// ===============================
// STEP 3: Apply Crop
// ===============================
const applyCropButton = page.getByRole('button', { name: 'Apply' });
await applyCropButton.waitFor({ state: 'visible' });
await applyCropButton.click();
console.log('✅ Logo crop applied');

// Wait for upload to complete
await page.waitForTimeout(1500);

// ===============================
// STEP 4: Edit Company Name
// ===============================
function generateRandomCompanyName(minLength = 5, maxLength = 50) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  let name = '';
  for (let i = 0; i < length; i++) {
    name += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return name;
}

const updatedCompanyName = `Updated_${generateRandomCompanyName()}`;

// Locate input
const companyNameInput = page.locator('input[name="company_name"]');
await companyNameInput.waitFor({ state: 'visible' });

// Clear and fill
await companyNameInput.fill('');
await companyNameInput.fill(updatedCompanyName);

// Validate
await expect(companyNameInput).toHaveValue(updatedCompanyName);
console.log('✅ Company name updated:', updatedCompanyName);


const typeDropdown = page.getByRole('combobox', { name: 'Type' });

// Open dropdown
await typeDropdown.waitFor({ state: 'visible' });
await typeDropdown.click();

// Get available options
const typeOptions = page.getByRole('option');
await typeOptions.first().waitFor();

// Select random option (skip first if it's "None")
const typeCount = await typeOptions.count();
const randomTypeIndex =
  typeCount > 1 ? Math.floor(Math.random() * (typeCount - 1)) + 1 : 0;

await typeOptions.nth(randomTypeIndex).click();
console.log('✅ Company type updated');

// ===============================
// STEP 6: Edit Industry
// ===============================
const industryDropdown = page.getByRole('combobox', { name: 'Industry' });

// Open dropdown
await industryDropdown.waitFor({ state: 'visible' });
await industryDropdown.click();

// Get industry options
const industryOptions = page.getByRole('option');
await industryOptions.first().waitFor();

// Select random industry (skip first if placeholder)
const industryCount = await industryOptions.count();
const randomIndustryIndex =
  industryCount > 1 ? Math.floor(Math.random() * (industryCount - 1)) + 1 : 0;

await industryOptions.nth(randomIndustryIndex).click();
console.log('✅ Industry updated');

// ---------- Helper functions ----------
function generateRandomAddress(min = 10, max = 250) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,.-';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateRandomCity(min = 2, max = 50) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
}

function generateRandomPostalCode(min = 3, max = 10) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

// ---------- Address 1: click dropdown ----------
const addressCard = page
  .locator('div.mt-4.mb-4')
  .filter({ hasText: 'Address 1' })
  .first();

await addressCard.waitFor({ state: 'visible' });

// Click dropdown arrow (last action icon)
await addressCard.locator('div.flex.gap-4 > div').last().click();
console.log('✅ Address dropdown opened');

// ---------- Scroll form ----------
await page.mouse.wheel(0, 800);

// ---------- Edit Address ----------
const addressInput = page.locator('input[name="temp_location.address"]').first();
await addressInput.waitFor({ state: 'visible' });
await addressInput.fill(generateRandomAddress());

// ---------- Select Country ----------
const countryDropdown = page.getByRole('combobox', { name: 'Country' }).first();
await countryDropdown.click();

const countryOptions = page.getByRole('option');
await countryOptions.first().waitFor();
await countryOptions.nth(Math.floor(Math.random() * await countryOptions.count())).click();

// ---------- Select State ----------
const stateDropdown = page.getByRole('combobox', { name: 'State' }).first();
await stateDropdown.click();

const stateOptions = page.getByRole('option');
await stateOptions.first().waitFor();
await stateOptions.nth(Math.floor(Math.random() * await stateOptions.count())).click();

// ---------- Edit City ----------
const cityInput = page.locator('input[name="temp_location.city"]').first();
await cityInput.fill(generateRandomCity());

// ---------- Edit Postal Code ----------
const postalCodeInput = page.locator('input[name="temp_location.postal_code"]').first();
await postalCodeInput.fill(generateRandomPostalCode());


// Locate Address 2 card specifically
const address2Card = page
  .locator('div.mt-4.mb-4')
  .filter({ hasText: 'Address 2' });

// Ensure it exists
await address2Card.waitFor({ state: 'visible' });
await address2Card.scrollIntoViewIfNeeded();

// Inside Address 2 → click DELETE icon (first button)
const deleteButton = address2Card
  .locator('div[data-slot="hover-card-trigger"]')
  .first();

await deleteButton.waitFor({ state: 'visible' });
await deleteButton.click();

console.log('🗑️ Deleted Address 2');


// ---------- Click Save ----------
const saveButton = page.getByRole('button', { name: 'Save', exact: true });
await saveButton.waitFor({ state: 'visible' });
await saveButton.click();
  await page.waitForTimeout(1000);
console.log('✅ Address updated and saved successfully');

  await page.waitForTimeout(1000);

});


