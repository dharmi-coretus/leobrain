const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

test('Edit Job from Draft', async ({ page }) => {

  // Step 1: Sign in
  await signIn(page);

  // Navigate to Jobs
  await page.locator('button:has-text("Jobs")').click();

  // Select Draft tab
  await page.locator('button:has-text("Draft")').click();

await page.waitForSelector('div.rounded-\\[12px\\]');

const firstCard = page.locator('div.rounded-\\[12px\\]').first();
 await page.waitForTimeout(1000);
await firstCard.locator('button[aria-haspopup="menu"]').click();
 await page.waitForTimeout(1000);


// Click Edit from dropdown
await page.getByRole('menuitem', { name: 'Edit' }).click();
await page.waitForTimeout(1000);

const url = page.url();

if (url.includes('/description')) {
  const descriptionEditor = page.locator(
    'label:has-text("Description") ~ div div[contenteditable="true"]'
  );

  await descriptionEditor.click();
  await page.keyboard.type(
    'We are looking for a QA Engineer responsible for manual and automation testing.'
  );

  await expect(descriptionEditor).toContainText('QA Engineer');

  console.log('✅ Description added');

  // =========================
  // 📌 RESPONSIBILITIES
  // =========================
  const responsibilitiesEditor = page.locator(
    'label:has-text("Responsibilities") ~ div div[contenteditable="true"]'
  );

  await responsibilitiesEditor.click();
  await page.keyboard.type(
    '• Design and execute test cases\n' +
    '• Perform regression and smoke testing\n' +
    '• Collaborate with developers and product teams'
  );

  await expect(responsibilitiesEditor).toContainText('test cases');

  console.log('✅ Responsibilities added');

  // =========================
  // 🎓 QUALIFICATIONS
  // =========================
  const qualificationsEditor = page.locator(
    'label:has-text("Qualifications") ~ div div[contenteditable="true"]'
  );

  await qualificationsEditor.click();
  await page.keyboard.type(
    '• Bachelor’s degree in Computer Science or related field\n' +
    '• 2+ years of QA experience\n' +
    '• Strong knowledge of Playwright and API testing'
  );

  await expect(qualificationsEditor).toContainText('Playwright');

  console.log('✅ Qualifications added');

  // =========================
  // 🧠 SKILLS (Tags Input)
  // =========================
  const skillsInput = page.locator(
  'label:has-text("Skills") ~ div input'
);

// Clear existing skills
const removeSkillButtons = page.locator(
  'label:has-text("Skills") ~ div button'
);

while (await removeSkillButtons.count() > 0) {
  await removeSkillButtons.first().click();
}

const skills = [
  'Playwright',
  'Manual Testing',
  'Automation Testing',
  'API Testing',
  'Agile'
];

for (const skill of skills) {
  await skillsInput.click();
  await skillsInput.fill(skill);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
}

// ✅ FIXED assertion
const skillsSection = page.locator(
  'label:has-text("Skills") ~ div'
);

for (const skill of skills) {
  await expect(
    skillsSection.locator(`text=${skill}`)
  ).toBeVisible();
}

console.log('✅ Skills added');

  // =========================
  // ➡️ NEXT BUTTON
  // =========================
  const nextButton = page.locator('button:has-text("Next")');
  await expect(nextButton).toBeEnabled();
  await nextButton.click();

  console.log('🚀 Description page completed successfully');
}

// --- Start of Payout-Specific Logic ---

// Check if the current URL contains 'payout'
if (page.url().includes('payout')) {
  console.log("💰 Payout URL detected. Configuring Pay Structure...");

  // 1. Define Locators
  const payStructureDropdown = page.getByRole('combobox', { name: 'Pay Structure' });
  const ddlPayFrequency = page.getByRole('combobox', { name: 'Pay Frequency' });

  // 2. Open Pay Structure Dropdown
  await payStructureDropdown.click();
  
  // NOTE: Playwright automatically waits for elements to be actionable, 
  // so the hardcoded 'await page.waitForTimeout(500);' is generally replaced 
  // by Playwright's auto-wait on the next action.
  
  // 3. Read Pay Structure from Environment Variables (Assuming q is available)
  const envKey = `PAY_STRUCTURE_${q}`;
  const rawPayStructure = (process.env[envKey] || "")
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);

  if (rawPayStructure.length === 0) {
    console.log(`⚠ No Pay Structure found in environment variable: ${envKey}. Skipping selection.`);
  } else {
    // 4. Select the Pay Structure Option (usually just one selection)
    const structureToSelect = rawPayStructure[0];
    const optionLocator = page.getByRole('option', { name: structureToSelect, exact: true });

    if (await optionLocator.isVisible()) {
      await optionLocator.click();
      console.log(`  ✔ Selected Pay Structure: ${structureToSelect}`);
    } else {
      console.log(`  ⚠ Pay Structure option not found: ${structureToSelect}`);
    }
  }

  // 5. Select Pay Frequency (Assuming you need to select this next)
  const envFreqKey = `PAY_FREQUENCY_${q}`;
  const rawPayFrequency = (process.env[envFreqKey] || "")
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);

  if (rawPayFrequency.length > 0) {
    const frequencyToSelect = rawPayFrequency[0];
    await ddlPayFrequency.click();
    await page.getByRole('option', { name: frequencyToSelect, exact: true }).click();
    console.log(`  ✔ Selected Pay Frequency: ${frequencyToSelect}`);
  }

  // You may need an await page.locator('html').click() here to close dropdowns if necessary.
}
// --- End of Payout-Specific Logic ---


});
