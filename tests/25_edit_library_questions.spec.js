const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
require('dotenv').config();

/* ---------------- UTILITIES ---------------- */
function randomString(min = 5, max = 50) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('').trim();
}

function randomNumber(min = 1, max = 10000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

/* ---------------- TEST ---------------- */
test('Edit library question with random text and type', async ({ page }) => {
  await signIn(page);

  await page.getByRole('button', { name: 'Library' }).click();
  await page.getByRole('button', { name: 'My Library' }).click();

  await page.locator('div.space-y-5 > div.cursor-pointer').first().click();
  await page.waitForLoadState('networkidle');

  const questionCard = page.locator('div.grid.cursor-pointer').first();
  await questionCard.click();

  await questionCard.locator('button[aria-haspopup="menu"]').click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();

  const modal = page.locator('div[role="dialog"]');
  await modal.waitFor({ state: 'visible' });

  /* -------- Edit Question Text -------- */
  await modal.locator('input[name="question"]').fill(randomString(20, 100));

  /* =====================================================
     QUESTION TYPE SELECTION (EXACTLY YOUR LOGIC)
     ===================================================== */
  const typeDropdown = modal.locator('button[role="combobox"]')
    .filter({ hasText: /Single Select|Multiple Select|Long Answer|Short Answer|Number/ });

  await typeDropdown.first().click();

  const options = page.locator('[role="option"]');
  await options.first().waitFor({ state: 'visible' });

  const optionTotal = await options.count();
  const randomIndex = Math.floor(Math.random() * optionTotal);

  const selectedType = (await options.nth(randomIndex).innerText()).trim();
  await options.nth(randomIndex).click();

  console.log(`✔ Selected question type: ${selectedType}`);

  /* -------- Difficulty -------- */
  const difficultyRadios = modal.locator('button[role="radio"]');
  await difficultyRadios.nth(Math.floor(Math.random() * await difficultyRadios.count())).click();

  /* =====================================================
     HANDLE FIELDS BASED ON SELECTED TYPE
     ===================================================== */

  // Clear existing options if any
  const removeIcons = modal.locator('svg.lucide-x');
  while (await removeIcons.count() > 0) {
    await removeIcons.first().click();
  }

  /* -------- SINGLE / MULTIPLE SELECT (FIXED) -------- */
if (selectedType === 'Single Select' || selectedType === 'Multiple Select') {
  const optionCount = selectedType === 'Single Select' ? 3 : 4;
  const correctCount = selectedType === 'Single Select' ? 1 : 2;

  const optionsContainer = modal.locator('label', { hasText: 'Options' }).locator('..');

  const addOptionBtn = optionsContainer.locator(
    'button:has(svg[width="20"], svg[height="20"])'
  ).last();

  // --- Add & fill options ---
  for (let i = 0; i < optionCount; i++) {
    const optionInputs = optionsContainer.locator('input[type="text"]');

    if (i > 0) {
      const beforeCount = await optionInputs.count();
      await addOptionBtn.click();
      await expect(optionInputs).toHaveCount(beforeCount + 1);
    }

    await optionInputs.nth(i).fill(randomString(5, 40));
  }

  // --- Select correct answers ---
  const correctIcons = optionsContainer.locator(
    'button:has(svg[width="28"], svg[height="28"])'
  );

  await expect(correctIcons).toHaveCount(optionCount);

  const indexes = shuffle([...Array(optionCount).keys()]).slice(0, correctCount);

  for (const idx of indexes) {
    await correctIcons.nth(idx).click();
  }
}

  /* -------- SHORT / LONG ANSWER -------- */
  else if (selectedType === 'Short Answer' || selectedType === 'Long Answer') {
    const answerBox = modal.locator('textarea[name="single_answer"]');
    await answerBox.fill(
      selectedType === 'Short Answer'
        ? randomString(10, 200)
        : randomString(50, 500)
    );
  }

  /* -------- NUMBER -------- */
  else if (selectedType === 'Number') {
    const numberInput = modal.locator('textarea[name="single_answer"], input[type="text"]').last();
    await numberInput.fill(randomNumber().toString());
  }

  /* -------- SAVE -------- */
  await modal.getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState('networkidle');

  console.log('✅ Question edited successfully');
});
