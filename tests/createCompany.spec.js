// tests/createCompany.spec.js
const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

// Function to generate random alphanumeric string
function generateRandomString(chars, minLength, maxLength) {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Function to generate random company name
function generateRandomCompanyName(minLength = 2, maxLength = 100) {
    return `AutoCompany_${generateRandomString('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', minLength, maxLength)}`;
}

// Function to generate random address
function generateRandomAddress(minLength = 10, maxLength = 250) {
    return generateRandomString('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,.-', minLength, maxLength);
}

// Function to generate random city (alphabets only)
function generateRandomCity(minLength = 2, maxLength = 100) {
    return generateRandomString('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', minLength, maxLength);
}

// Function to generate random numeric postal code
function generateRandomPostalCode(minLength = 3, maxLength = 10) {
    return generateRandomString('0123456789', minLength, maxLength);
}

// Function to fill location fields
async function fillLocation(page) {
    // Address
    const address = generateRandomAddress();
    const addressInput = page.locator('input[name="temp_location.address"]').last();
    await addressInput.waitFor({ state: 'visible' });
    await addressInput.fill(address);
    await expect(addressInput).toHaveValue(address);
    console.log('Address:', address);

    // Country
    const countryDropdown = page.getByRole('combobox', { name: 'Country' }).last();
    await countryDropdown.click();
    const countryOptions = page.getByRole('option');
    await countryOptions.first().waitFor();
    const randomCountryIndex = Math.floor(Math.random() * (await countryOptions.count()));
    await countryOptions.nth(randomCountryIndex).click();
    console.log('Country selected');

    // State
    const stateDropdown = page.getByRole('combobox', { name: 'State' }).last();
    await stateDropdown.click();
    const stateOptions = page.getByRole('option');
    await stateOptions.first().waitFor();
    const randomStateIndex = Math.floor(Math.random() * (await stateOptions.count()));
    await stateOptions.nth(randomStateIndex).click();
    console.log('State selected');

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

test('Go to Settings menu and create Company with multiple locations', async ({ page }) => {
    // Sign in
    await signIn(page);
    await page.waitForTimeout(1000);

    // Open Settings -> Company
    const settingsButton = page.locator('button:has-text("Settings")');
    await settingsButton.waitFor({ state: 'visible' });
    await settingsButton.scrollIntoViewIfNeeded();
    await settingsButton.click();
    await page.waitForTimeout(1000);

    await page.locator('button[data-slot="button"]', { hasText: 'Company' }).click();
    await page.waitForLoadState('networkidle');

    // Upload logo
    await page.locator('input[type="file"]').first().setInputFiles('tests/fixtures/logo.png');
    await page.getByRole('button', { name: 'Apply' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Apply' }).click();

    // Company name
    const companyName = generateRandomCompanyName();
    const companyInput = page.locator('input[name="company_name"]');
    await companyInput.waitFor({ state: 'visible' });
    await companyInput.fill(companyName);
    await page.waitForTimeout(500);
    console.log('Company Name:', companyName);

    // Type dropdown
    const typeDropdown = page.getByRole('combobox', { name: 'Type' });
    await typeDropdown.click();
    const typeOptions = page.getByRole('option');
    const typeCount = await typeOptions.count();
    await typeOptions.nth(Math.floor(Math.random() * (typeCount - 1) + 1)).click();

    // Industry dropdown
    const industryDropdown = page.getByRole('combobox', { name: 'Industry' });
    await industryDropdown.click();
    const industryOptions = page.getByRole('option');
    const industryCount = await industryOptions.count();
    await industryOptions.nth(Math.floor(Math.random() * (industryCount - 1) + 1)).click();

    // Number of locations
    const numberOfLocations = 3;

    for (let i = 0; i < numberOfLocations; i++) {
        if (i > 0) {
            const newLocationButton = page.getByRole('button', { name: 'New Location', exact: true });
            await newLocationButton.waitFor({ state: 'visible' });
            await newLocationButton.click();
        }
        await fillLocation(page);
    }

    // Click Create button
    const createButton = page.locator('button[type="submit"]');
    await createButton.waitFor({ state: 'visible' });
    await createButton.click();
    await page.waitForTimeout(2000);
});
