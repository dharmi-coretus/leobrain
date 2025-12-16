const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

test('Edit Job from Draft', async ({ page }) => {
 // 📌 OR use variable from create job
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

 // ---- STEP 1: Select all job rows ----
const rows = page.locator(
  '#root > div.relative.grid.h-screen.grid-cols-[220px_1fr].grid-rows-[60px_1fr].transition-all.duration-300.ease-in-out > div.bg-background.relative.h-full.overflow-auto > div > div.overflow-auto.p-6 > div > div > div.space-y-5 > div'
);

const count = await rows.count();
console.log("🔥 Total jobs:", count);

if (count === 0) {
    throw new Error("❌ No jobs found!");
}

// ---- STEP 2: Pick random index ----
const randomIndex = Math.floor(Math.random() * count);
console.log("🎲 Random Job Index:", randomIndex);

// ---- STEP 3: Select that job row ----
const randomJob = rows.nth(randomIndex);

// ---- STEP 4: Extract job name (optional) ----
const jobName = await randomJob.locator(
  'div.grid.grid-cols-[auto_1fr_auto_auto] div.flex p.text-sub-foreground.truncate.text-sm.font-medium'
).innerText();

console.log("🎯 Selected Job:", jobName);

// ---- STEP 5: Click 3-dot button or card ----

// 👉 Option A: Click job card
await randomJob.click();

// 👉 Option B: Click 3-dot menu inside the same job
// await randomJob.locator('button[data-slot="dropdown-menu-trigger"]').click();

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
