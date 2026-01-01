const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();


// ---------- UTILS ----------
function randomSkill(minLength = 3, maxLength = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  let skill = '';
  for (let i = 0; i < length; i++) {
    skill += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return skill;
}

test('Create Library - Add Generate Multiple Question Types', async ({ page }) => {
  await signIn(page);

  await page.getByRole('button', { name: 'Library' }).click();
  await page.getByRole('button', { name: 'My Library' }).click();

  const firstLibraryCard = page.locator('div.space-y-5 > div.cursor-pointer').first();
  await firstLibraryCard.click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Question' }).first().click();

  // Using role + name if accessible
await page.getByRole('button', { name: 'Generate' }).click();
// 1️⃣ Open Question Type dropdown
const questionTypeDropdown = page.getByRole('combobox', {
  name: 'Question Type',
});
await questionTypeDropdown.click();
console.log('✔ Opened Question Type dropdown');

// 2️⃣ Wait for listbox
const listbox = page.getByRole('listbox');
await listbox.waitFor({ state: 'visible' });

// 3️⃣ Get all checkbox buttons INSIDE the dropdown
const checkboxes = listbox.locator('button[role="checkbox"]');
const checkboxCount = await checkboxes.count();

console.log(`✔ Found ${checkboxCount} question type checkboxes`);

// 4️⃣ Click all unchecked checkboxes
for (let i = 0; i < checkboxCount; i++) {
  const checkbox = checkboxes.nth(i);

  const isChecked = await checkbox.getAttribute('aria-checked');

  if (isChecked !== 'true') {
    await checkbox.scrollIntoViewIfNeeded();
    await checkbox.click();
    console.log(`✔ Checked option ${i + 1}`);
    await page.waitForTimeout(150); // REQUIRED for Radix
  }
}

// 5️⃣ Close dropdown using Escape (BEST for Radix)
await page.keyboard.press('Escape');
console.log('✔ Closed Question Type dropdown');



// 1️⃣ Get all radio buttons inside the Difficulty Level group
const difficultyButtons = page.locator('div[role="radiogroup"] button[role="radio"]');
const difficultyCount = await difficultyButtons.count(); // renamed variable

// 2️⃣ Pick a random index
const randomIndex = Math.floor(Math.random() * difficultyCount);

// 3️⃣ Click the randomly selected radio button
await difficultyButtons.nth(randomIndex).click();

// 4️⃣ Log the selected difficulty
const selectedDifficulty = await difficultyButtons.nth(randomIndex).getAttribute('value');
console.log('✔ Selected Difficulty Level:', selectedDifficulty);

// 1️⃣ Locate the plus button and input field
const plusButton = page.locator('input[name="no_of_question"] + button'); // the button after input
const questionInput = page.locator('input[name="no_of_question"]');

// 2️⃣ Generate a random number of questions between 1 and 10
const randomQuestions = Math.floor(Math.random() * 10) + 1; // 1 to 10

// 3️⃣ Click the plus button appropriate number of times
for (let i = 1; i < randomQuestions; i++) { // start from 1 because default is 1
    await plusButton.click();
    await page.waitForTimeout(100); // small delay to mimic real clicks
}

// 4️⃣ Log the final value
const finalValue = await questionInput.inputValue();
console.log(`✔ Number of Questions set to: ${finalValue}`);

// Locate the skills input
const skillsInput = page.locator(
  'label:has-text("Skills") >> .. >> input[type="text"]'
);

// Decide random number of skills (1–10)
const skillsCount = Math.floor(Math.random() * 10) + 1;
console.log(`✔ Adding ${skillsCount} skills`);

for (let i = 0; i < skillsCount; i++) {
  const skill = randomSkill(3, 10);

  await skillsInput.fill(skill);
  await skillsInput.press('Enter');

  console.log(`✔ Added skill ${i + 1}: ${skill}`);

  // Small delay so UI can render chip
  await page.waitForTimeout(200);
}
const generateBtn = page.getByRole('button', { name: 'Generate' });

await expect(generateBtn).toBeEnabled();
await generateBtn.click();

});