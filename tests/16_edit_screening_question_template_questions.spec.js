const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

// ---------- UTILS ----------
function getRandomQuestion(min = 10, max = 150) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('').trim();
}

function randomOption() {
  return `Option-${Math.random().toString(36).slice(2, 7)}`;
}

// ---------- TEST ----------
test('Edit screening question in template with random question type', async ({ page }) => {

  // 🔐 Login
  await signIn(page);

  // 📂 Navigate to Screening Questions
  await page.getByRole('button', { name: 'Templates' }).click();
  await page.locator('button', { hasText: 'Screening Questions' }).click();

  // 🧩 Open first template
  const firstTemplate = page.locator('div.cursor-pointer.rounded-\\[12px\\]').first();
  await firstTemplate.locator('button[data-slot="dropdown-menu-trigger"]').click();
  await page.locator('div[role="menuitem"]:has-text("Edit")').click();

  // 💾 Save template (if required)
  await page.locator('button[type="submit"]:has-text("Save")').click();

  // 🧩 Open first question
  const firstQuestion = page.locator('.bg-sub-background.rounded-\\[10px\\].border').first();
  await firstQuestion.locator('button[data-slot="dropdown-menu-trigger"]').click();
  await page.locator('div[role="menuitem"]:has-text("Edit")').click();

  // ⬆ Scroll top
  await page.evaluate(() => window.scrollTo(0, 0));

  // ✏ Edit question text
  const questionInput = page.locator('input[name="question"]').first();
  await questionInput.fill(getRandomQuestion());
  console.log('✅ Question text updated');

  // ---------- SELECT RANDOM QUESTION TYPE ----------
  const typeDropdown = page
    .locator('label', { hasText: 'Type' })
    .locator('..')
    .locator('button[role="combobox"]')
    .first();

  await typeDropdown.click();

  const typeOptions = page.locator('div[role="option"]').filter({ hasText: /\S/ });
  const typeCount = await typeOptions.count();

  const randomIndex = Math.floor(Math.random() * typeCount);
  const selectedType = typeOptions.nth(randomIndex);
  const questionType = (await selectedType.textContent()).trim();

  await selectedType.click();
  await page.waitForTimeout(2000);
  console.log(`✅ Question type selected: ${questionType}`);

  // ---------- ADDITIONAL FIELDS ----------
  if (['Single Select', 'Multiple Select', 'Dropdown'].includes(questionType)) {
    for (let i = 0; i < 2; i++) {
      const optionInputs = page.locator('input[name^="options"]');
      if ((await optionInputs.count()) <= i) {
        await page.locator('button:has-text("Option")').click();
        await page.waitForTimeout(2000);
      }
      await optionInputs.nth(i).fill(randomOption());
    }
    console.log('✅ Options added');
  }

  else if (questionType === 'File Upload') {
    // 1️⃣ Open File Type dropdown (scope to latest question)
  const fileTypeWrapper = page
    .locator('label', { hasText: 'File Type' })
    .last()
    .locator('..');

  const ddlFileType = fileTypeWrapper.locator('button[role="combobox"]');
  await ddlFileType.waitFor({ state: 'visible', timeout: 5000 });
  await ddlFileType.click();
  console.log('✅ File Type dropdown opened');

  // 2️⃣ Get Radix listbox id
  const listBoxId = await ddlFileType.getAttribute('aria-controls');
  if (!listBoxId) {
    throw new Error('❌ aria-controls not found for File Type dropdown');
  }

  // 3️⃣ Locate the actual dropdown content (PORTAL)
  const listBox = page.locator(`#${listBoxId}`);
  await listBox.waitFor({ state: 'visible', timeout: 5000 });

  // 4️⃣ Get clickable option rows (exclude headers)
  const options = listBox.locator('div')
    .filter({ hasText: /\S/ })           // non-empty
    .filter({ hasNotText: 'Transport' }); // exclude category header

  const total = await options.count();
  console.log(`ℹ Found ${total} File Type options`);

  if (total < 2) {
    console.log('⚠ Not enough File Type options');
  } else {
    // 5️⃣ Pick 2 random unique options
    const selectedIndexes = new Set();
    while (selectedIndexes.size < 2) {
      selectedIndexes.add(Math.floor(Math.random() * total));
    }

    for (const index of selectedIndexes) {
      const option = options.nth(index);
      await option.scrollIntoViewIfNeeded();
      await option.click({ force: true });

      const text = await option.textContent();
      console.log(`✔ Selected File Type: ${text?.trim()}`);
    }
  }

  // 6️⃣ Close dropdown
  await page.keyboard.press('Escape');
  console.log('✅ File Type dropdown closed');
  }

  else {
    // Rating, Short Answer, Long Answer, Number, Date Picker
    console.log('ℹ No additional fields required');
  }

  // ---------- SAVE QUESTION ----------
  const saveBtn = page.locator('button[type="submit"]:has-text("Save")');
  await saveBtn.waitFor({ state: 'visible' });
  await saveBtn.click();
await page.waitForTimeout(2000);
  console.log('🎉 Screening question edited successfully');
});
