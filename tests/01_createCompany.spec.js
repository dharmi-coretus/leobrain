// tests/createCompany.spec.js
const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();


// ---------------- Random helpers ----------------
function generateRandomString(chars, minLength, maxLength) {
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateRandomCompanyName(minLength = 2, maxLength = 100) {
  return `AutoCompany_${generateRandomString(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    minLength,
    maxLength
  )}`;
}

function generateRandomAddress(minLength = 10, maxLength = 250) {
  return generateRandomString(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,.-',
    minLength,
    maxLength
  );
}

function generateRandomCity(minLength = 2, maxLength = 100) {
  return generateRandomString(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    minLength,
    maxLength
  );
}

function generateRandomPostalCode(minLength = 3, maxLength = 10) {
  return generateRandomString('0123456789', minLength, maxLength);
}

// ---------------- Location helper (FIXED) ----------------
async function fillLocation(page) {
  // Address
  const address = generateRandomAddress();
  const addressInput = page.locator('input[name="temp_location.address"]').last();
  await addressInput.waitFor({ state: 'visible' });
  await addressInput.fill(address);
  await expect(addressInput).toHaveValue(address);
  console.log('Address:', address);

  const countryDropdown = page.getByRole('combobox', { name: 'Country' }).last();
  const stateDropdown = page.getByRole('combobox', { name: 'State' }).last();

  let stateSelected = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 5;

  while (!stateSelected && attempts < MAX_ATTEMPTS) {
    attempts++;

    // Select random country
    await countryDropdown.click();
    const countryOptions = page.getByRole('option');
    await countryOptions.first().waitFor();

    const countryCount = await countryOptions.count();
    const randomCountryIndex = Math.floor(Math.random() * countryCount);
    await countryOptions.nth(randomCountryIndex).click();
    console.log(`Country selected (attempt ${attempts})`);

    // Wait for state list to refresh
    await page.waitForTimeout(800);

    // Open state dropdown
    await stateDropdown.click();
    const stateOptions = page.getByRole('option');
    const stateCount = await stateOptions.count();

    if (stateCount === 0) {
      console.log('⚠️ State list empty, changing country...');
      await page.keyboard.press('Escape');
      continue;
    }

    // Select random state
    const randomStateIndex = Math.floor(Math.random() * stateCount);
    await stateOptions.nth(randomStateIndex).click();
    console.log('State selected');

    stateSelected = true;
  }

  if (!stateSelected) {
    throw new Error('❌ No states found after multiple country selections');
  }

  // City
  const city = generateRandomCity();
  const cityInput = page.locator('input[name="temp_location.city"]').last();
  await cityInput.waitFor({ state: 'visible' });
  await cityInput.fill(city);
  await expect(cityInput).toHaveValue(city);
  console.log('City:', city);

  // Postal Code
  const postalCode = generateRandomPostalCode();
  const postalInput = page.locator('input[name="temp_location.postal_code"]').last();
  await postalInput.waitFor({ state: 'visible' });
  await postalInput.fill(postalCode);
  await expect(postalInput).toHaveValue(postalCode);
  console.log('Postal Code:', postalCode);
}

// ---------------- TEST ----------------
test('Go to Settings menu and create Company with multiple locations', async ({ page }) => {
  await signIn(page);
  await page.waitForTimeout(1000);

  // Open Settings → Company
  const settingsButton = page.locator('button:has-text("Settings")');
  await settingsButton.waitFor({ state: 'visible' });
  await settingsButton.click();

  await page.locator('button[data-slot="button"]', { hasText: 'Company' }).click();
  await page.waitForLoadState('networkidle');

  // Upload logo
  await page.locator('input[type="file"]').first().setInputFiles('tests/fixtures/logo.png');
  await page.getByRole('button', { name: 'Apply' }).click();

  // Company name
  const companyName = generateRandomCompanyName();
  const companyInput = page.locator('input[name="company_name"]');
  await companyInput.fill(companyName);
  console.log('Company Name:', companyName);

  // Type dropdown
  const typeDropdown = page.getByRole('combobox', { name: 'Type' });
  await typeDropdown.click();
  const typeOptions = page.getByRole('option');
  await typeOptions.nth(Math.floor(Math.random() * (await typeOptions.count() - 1) + 1)).click();

  // Industry dropdown
  const industryDropdown = page.getByRole('combobox', { name: 'Industry' });
  await industryDropdown.click();
  const industryOptions = page.getByRole('option');
  await industryOptions.nth(Math.floor(Math.random() * (await industryOptions.count() - 1) + 1)).click();

  // Add locations
  const numberOfLocations = 3;

  for (let i = 0; i < numberOfLocations; i++) {
    if (i > 0) {
      await page.getByRole('button', { name: 'New Location', exact: true }).click();
    }
    await fillLocation(page);
  }

  // Create company
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);
});
