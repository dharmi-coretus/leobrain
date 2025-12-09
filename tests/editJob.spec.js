const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

test('Edit Job from Draft', async ({ page }) => {

  const jobName = process.env.JOB_NAME;   // 📌 OR use variable from create job
  console.log("🔍 Searching job:", jobName);

   // Step 1: Sign in
  await signIn(page);
  await page.waitForTimeout(1000); // wait before clicking

  // -------- 1️⃣ Navigate to Jobs section ----------
  await page.locator('button:has-text("Jobs")').click();
  await page.waitForTimeout(1000);

  // -------- 2️⃣ Select Draft tab ----------
  await page.locator('button:has-text("Draft")').click();
  await page.waitForTimeout(1500);

  // -------- 3️⃣ Search Job Name in Draft list ----------
  await page.fill('input[placeholder="Search"]', jobName);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  // -------- 4️⃣ Click Action (three dots ⋮ icon) ----------
  const actionIcon = page.locator(`tr:has-text("${jobName}") svg[width="20"][height="20"]`);
  await actionIcon.first().click();
  await page.waitForTimeout(1000);

  // -------- 5️⃣ Click Edit from dropdown ----------
  await page.getByRole('menuitem', { name: /Edit/i }).click();
  await page.waitForTimeout(1500);

  // -------- 6️⃣ Edit Description (Example) ----------
  await page.fill('#description', '');
  await page.fill('#description', 'Updated job description via automation');

  // -------- 7️⃣ Click Update / Save button ----------
  await page.locator('button:has-text("Update")').click();

  // -------- 8️⃣ Confirmation check ----------
  await expect(page.getByText(/Job updated successfully/i)).toBeVisible();
  console.log("🎉 Job edited successfully!");

});
