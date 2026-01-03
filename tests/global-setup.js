const { chromium } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // 🔐 Login once
  await signIn(page);

  // 💾 Save cookies + localStorage + sessionStorage
  await context.storageState({
    path: 'storageState.json',
  });

  await browser.close();
}

module.exports = globalSetup;
