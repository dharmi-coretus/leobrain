const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

// ---------- UTILS ----------
function randomString(min, max) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomDescription(min = 3, max = 100) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.trim();
}

function getRandomStageName(min = 3, max = 30) {
  return getRandomDescription(min, max);
}

function getRandomStageDescription(min = 3, max = 100) {
  return getRandomDescription(min, max);
}

// ---------- TEST ----------
test('Go to template menu and add pipeline template with interview and assessment stage', async ({ page }) => {

  // 🔐 Sign in
  await signIn(page);

  // ⚙️ Open Templates
  await page.getByRole('button', { name: 'Templates' }).click();

  const pipelineButton = page.locator('button', { hasText: 'Pipeline' });
  await pipelineButton.waitFor({ state: 'visible' });
  await pipelineButton.click();

  const templateButton = page.getByRole('button', { name: 'Template' }).nth(1);
  await templateButton.click();

  // ---------- ICON SELECTION ----------
  await page
    .locator('button[role="combobox"][data-slot="select-trigger"]')
    .first()
    .click();

  const iconOption = page.locator('div[role="option"]').first();
  await iconOption.waitFor({ state: 'visible' });
  await iconOption.click();

  // ---------- TEMPLATE DETAILS ----------
  await page.locator('input[name="name"]').fill(randomString(3, 30));
  await page.locator('input[name="description"]').fill(getRandomDescription());

  await page
    .locator('button[role="combobox"][data-slot="select-trigger"]:has-text("Pipeline")')
    .click();

  await page.locator('div[role="option"]', { hasText: 'Pipeline' }).click();

  await page.locator('button', { hasText: 'Save' }).click();

  // ======================================================
  // FIRST STAGE : INTERVIEW
  // ======================================================
  await page.locator('input[name="stage_name"]').first().fill(getRandomStageName());
  await page.locator('input[name="description"]').first().fill(getRandomStageDescription());

  await page.locator('button[role="radio"][value="Interview"]').first().click();

  await page.locator('button[type="submit"]', { hasText: 'Add' }).click();
  await page.waitForTimeout(800);

  // ======================================================
  // SECOND STAGE : ASSESSMENT
  // ======================================================
  await page.locator('input[name="stage_name"]').first().fill(getRandomStageName());
  await page.locator('input[name="description"]').first().fill(getRandomStageDescription());

  await page.locator('button[role="radio"][value="Assessment"]').first().click();

  await page.locator('button[type="submit"]', { hasText: 'Add' }).click();
  await page.waitForTimeout(800);

  // ---------- FINAL SAVE ----------
  await page.locator('button', { hasText: 'Save' }).click();
});
