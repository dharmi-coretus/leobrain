// playwright.config.js
// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',       // folder where your tests are located
  timeout: 120 * 1000,      // maximum time per test
  expect: {
    timeout: 5000,          // assertion timeout
  },

  use: {
    baseURL: "www.leobrain.com", // default base URL
    headless: false,       // set true to run tests without UI
    trace: 'on-first-retry', // collect trace if test fails
   // storageState: 'storageState.json' 
  },

  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
    }/*,
    {
      name: 'Firefox',
      use: { ...devices['Desktop Firefox'] },
    }
    ,{
      name: 'WebKit',
      use: { ...devices['Desktop Safari'] },
    },*/
  ],

  
});
