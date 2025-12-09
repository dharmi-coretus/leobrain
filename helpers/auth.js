// helpers/auth.js
const { expect } = require('@playwright/test');

async function signIn(page) {
  await page.goto(process.env.BASE_URL);

  // Wait for Sign-in link
  const signInLink = page.locator('a[href="/sign-in"]');
  
  // Fill credentials
const emailInput = page.locator('input[name="email"]');
await emailInput.click();
await emailInput.fill(process.env.EMAIL);

  await page.fill('input[name="password"]', process.env.PASSWORD );

  // Click Sign In
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForLoadState('networkidle');

  // Save session
  await page.context().storageState({ path: 'storageState.json' });

}

module.exports = { signIn };
