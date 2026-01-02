const { test, expect } = require('@playwright/test');
const { signIn } = require('../helpers/auth');
const path = require('path');
require('dotenv').config();

// Utility: generate random string between 5 and 50 characters
function randomCoreStatement(min = 5, max = 50) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text.trim();
}


function randomShortDescription(min = 10, max = 150) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text.trim();
}

function randomVisionText(min = 10, max = 150) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text.trim();
}

function randomMissionText(min = 10, max = 150) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text.trim();
}

// ---------- Helper: generate random rating ----------
function randomRating() {
  return (Math.random() * 5).toFixed(1); // 0.0 to 5.0, step 0.1
}


function randomString(min, max) {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('').trim();
}

// Helper to generate random string of given length
function randomString2(minLength, maxLength) {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result.trim();
}
     
async function selectRandomIcon(page, index) {
  const dropdown = page.locator('button[role="combobox"]').nth(index);
  await dropdown.scrollIntoViewIfNeeded();
  await dropdown.click();

  const options = page.locator('[role="listbox"] [role="option"]');
  await expect(options.first()).toBeVisible({ timeout: 5000 });

  const count = await options.count();
  const randomIndex = Math.floor(Math.random() * count);

  await options.nth(randomIndex).click();
}

async function addHighlight(page, index) {
  // ICON
  await selectRandomIcon(page, index);

  // TITLE (5–30)
  await page
    .locator(`input[name="highlights.${index}.title"]`)
    .fill(randomString(5, 30));

  // DESCRIPTION (10–50)
  await page
    .locator(`input[name="highlights.${index}.description"]`)
    .fill(randomString(10, 50));
}



/* ---------------- TEST ---------------- */
test('Create career page', async ({ page }) => {
  await signIn(page);

  await page.getByRole('button', { name: 'Apps' }).click();

  const editButton = page.locator(
  'button:has(svg path[d*="10.8332"])'
);

await editButton.waitFor({ state: 'visible' });
await editButton.click();


const { test, expect } = require('@playwright/test');
const path = require('path');



// ---------------- Company Logo ----------------
const companyLogoInput = page.locator('#logo'); // Company logo input
const companyChangeButton = page.locator('p.text-primary', { hasText: 'Change' }).filter({
  has: page.locator('label', { hasText: 'Company Logo' })
});

// Click "Change" if visible
if (await companyChangeButton.isVisible()) {
  await companyChangeButton.click();
}

// Upload new company logo
await companyLogoInput.setInputFiles(path.resolve(__dirname, 'fixtures/logo.png'));
console.log('Company logo uploaded');

// ---------------- Featured Image ----------------
const featuredLogoInput = page.locator('#featured_image'); // Featured image input
const featuredChangeButton = page.locator('p.text-primary', { hasText: 'Change' }).filter({
  has: page.locator('label', { hasText: 'Featured Image' })
});

// Click "Change" if visible
if (await featuredChangeButton.isVisible()) {
  await featuredChangeButton.click();
}

// Upload new featured image
await featuredLogoInput.setInputFiles(path.resolve(__dirname, 'fixtures/featured.png'));
console.log('Featured image uploaded');


await page.waitForLoadState('networkidle');

// Wait for UI to stabilize after uploads
await page.waitForLoadState('networkidle');

// Re-locate Core Statement input (stable selector)
const coreStatementInput = page.locator('input[name="core_statement"]');
await expect(coreStatementInput).toBeVisible();

// Generate random string
const coreStatementText = randomCoreStatement(5, 50);

// Focus input
await coreStatementInput.click();

// Clear existing text (React-safe)
await coreStatementInput.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
await coreStatementInput.press('Backspace');

// Type random value (real user typing)
await coreStatementInput.type(coreStatementText, { delay: 40 });

// Validation
const finalValue = await coreStatementInput.inputValue();
console.log('Random Core Statement:', finalValue, 'Length:', finalValue.length);

if (finalValue.length < 5 || finalValue.length > 50) {
  throw new Error('❌ Core Statement must be between 5 and 50 characters');
}


// Wait for UI to stabilize
await page.waitForLoadState('networkidle');

// Stable locator (DO NOT rely on dynamic id)
const shortDescriptionInput = page.locator('textarea[name="description"]');

// Ensure textarea is visible
await expect(shortDescriptionInput).toBeVisible();

// Generate random description
const shortDescriptionText = randomShortDescription(10, 150);

// Focus textarea
await shortDescriptionInput.click();

// Clear existing text (React-safe)
await shortDescriptionInput.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
await shortDescriptionInput.press('Backspace');

// Type new random description
await shortDescriptionInput.type(shortDescriptionText, { delay: 20 });

// Validation
const finalValue2 = await shortDescriptionInput.inputValue();
console.log('Short Description:', finalValue2);
console.log('Length:', finalValue2.length);

if (finalValue2.length < 10 || finalValue2.length > 150) {
  throw new Error('❌ Short Description must be between 10 and 150 characters');
}

// Wait for page to be stable
await page.waitForLoadState('networkidle');

// Use stable selector (avoid dynamic id)
const visionTextarea = page.locator('textarea[name="vision"]');

// Ensure visibility
await expect(visionTextarea).toBeVisible();

// Generate random vision text
const visionText = randomVisionText(10, 150);

// Focus textarea
await visionTextarea.click();

// Clear existing value (React-safe)
await visionTextarea.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
await visionTextarea.press('Backspace');

// Type new vision text
await visionTextarea.type(visionText, { delay: 20 });

// Validation
const finalValue3 = await visionTextarea.inputValue();
console.log('Our Vision:', finalValue3);
console.log('Length:', finalValue3.length);

if (finalValue3.length < 10 || finalValue3.length > 150) {
  throw new Error('❌ Our Vision must be between 10 and 150 characters');
}

// Ensure page is stable
await page.waitForLoadState('networkidle');

// Use stable selector (avoid dynamic id)
const missionTextarea = page.locator('textarea[name="mission"]');

// Wait until visible
await expect(missionTextarea).toBeVisible();

// Generate random mission text
const missionText = randomMissionText(10, 150);

// Focus textarea
await missionTextarea.click();

// Clear existing value safely (React-friendly)
await missionTextarea.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
await missionTextarea.press('Backspace');

// Enter new mission text
await missionTextarea.type(missionText, { delay: 20 });

// Validation
const finalValue4 = await missionTextarea.inputValue();
console.log('Our Mission:', finalValue4);
console.log('Length:', finalValue4.length);

if (finalValue4.length < 10 || finalValue4.length > 150) {
  throw new Error('❌ Our Mission must be between 10 and 150 characters');
}

const ratingSites = [
  { name: 'Google', index: 0 },
  { name: 'Glassdoor', index: 1 },
  { name: 'Clutch', index: 2 },
  { name: 'GoodFirms', index: 3 },
];

for (const site of ratingSites) {
  const rating = (Math.random() * 5).toFixed(1); // random 0.0 to 5.0
  console.log(`${site.name} Rating:`, rating);

  // --- Number input ---
  const numberInput = page.locator('input[type="number"][max="5"]').nth(site.index);
  await numberInput.click();                      // focus
  await numberInput.fill(rating.toString());      // type value
  await numberInput.dispatchEvent('input');      // fire input event
  await numberInput.dispatchEvent('change');     // fire change event
  await numberInput.evaluate(el => el.blur());   // commit in React

  // --- Range slider ---
  const rangeInput = page.locator('input[type="range"][max="5"]').nth(site.index);
  await rangeInput.evaluate((el, value) => {
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, rating);

  // --- Verify final value ---
  const finalValue = await numberInput.inputValue();
  console.log(`${site.name} Rating in UI:`, finalValue);
}

// Locate the Next button by data attribute
const nextButton = page.locator('button[data-slot="button"]', { hasText: 'Next' });

// Ensure it's visible and enabled
await expect(nextButton).toBeVisible();
await expect(nextButton).toBeEnabled();

// Click the Next button
await nextButton.click();

await page.waitForTimeout(1000);

/* ---------- ADD 6 HIGHLIGHTS ---------- */
for (let i = 0; i < 6; i++) {
  await addHighlight(page, i);

  if (i < 5) {
    // ✅ FIRST "Add New" button
    const addNewBtn = page
      .locator('button', { hasText: 'Add New' })
      .nth(0);

    await expect(addNewBtn).toBeVisible({ timeout: 5000 });
    await addNewBtn.scrollIntoViewIfNeeded();
    await addNewBtn.click();

    // ✅ React-safe wait for next highlight
    const nextTitleInput = page.locator(
      `input[name="highlights.${i + 1}.title"]`
    );
    await expect(nextTitleInput).toBeVisible({ timeout: 10000 });
  }
}

// 1️⃣ Locate the Steps section parent div
const stepsSection = page.locator('div', {
    has: page.locator('label', { hasText: 'Steps' })
});

// 2️⃣ Locate the "Add New" button only within that Steps section
let addNewStepBtn = stepsSection.locator('button', { hasText: 'Add New' });

// 3️⃣ Click repeatedly until the button is gone
while (await addNewStepBtn.count() > 0) {
    await addNewStepBtn.last().click();       // Click the last "Add New" button
    await page.waitForTimeout(200);           // Wait for UI to render new step
    // Re-locate the button in case DOM changed after adding a step
    addNewStepBtn = stepsSection.locator('button', { hasText: 'Add New' });
}

console.log("Clicked 'Add New' until no more buttons appeared in the Steps section");

// Locate the Steps section
const stepsSection2 = page.locator('div', { has: page.locator('label', { hasText: 'Steps' }) });

// Locate all step rows
const stepRows = stepsSection2.locator('div.flex.w-full.items-center.gap-4');
const stepCount = await stepRows.count();

for (let i = 0; i < stepCount; i++) {
    const step = stepRows.nth(i);

    // Step Title input (5-30 chars)
    const titleInput = step.locator('input[name^="hiring_process"][name$=".title"]');
    await titleInput.fill(randomString(5, 30));

    // Step Description input (10-50 chars)
    const descInput = step.locator('input[name^="hiring_process"][name$=".description"]');
    await descInput.fill(randomString(10, 50));
}

console.log(`Filled ${stepCount} steps with random titles and descriptions`);

// Locate the "Next" button by text
const nextButton2 = page.locator('button[data-slot="button"]', { hasText: 'Next' });

// Wait for it to be visible and enabled
await expect(nextButton2).toBeVisible();
await expect(nextButton2).toBeEnabled();

// Click the button
await nextButton2.click();
// Wait for page to be stable
await page.waitForLoadState('networkidle');
console.log('Clicked on Next button ✅');


const images = [
  path.resolve(__dirname, 'fixtures/career1.jpg'),
  path.resolve(__dirname, 'fixtures/career2.jpg'),
];

// Click the label to trigger file input
const label = page.locator('label.bg-side-bar-selected');
await label.click();

// Wait for the input inside the label
const fileInput = label.locator('input[type="file"]');
await fileInput.waitFor({ state: 'attached', timeout: 10000 });

// Upload all images
await fileInput.setInputFiles(images);
console.log('All images uploaded successfully ✅');


// 1️⃣ Open the dropdown
const benefitsDropdown = page.locator('button[role="combobox"][data-slot="popover-trigger"]');
await benefitsDropdown.click();

// 2️⃣ Wait for the popover content
const popover = page.locator('div[role="dialog"][data-slot="popover-content"]');
await popover.waitFor({ state: 'visible', timeout: 5000 });

// 3️⃣ Select all benefit items (buttons acting as checkboxes)
const benefitItems = popover.locator('div[data-slot="command-item"] button[role="checkbox"]');
const count = await benefitItems.count();

// 4️⃣ Decide how many random benefits to select
const numberToSelect = Math.min(3, count); // up to 3 random
const selectedIndexes = new Set();

// 5️⃣ Pick unique random indexes
while (selectedIndexes.size < numberToSelect) {
  const randomIndex = Math.floor(Math.random() * count);
  selectedIndexes.add(randomIndex);
}

// 6️⃣ Click the random checkboxes
for (const index of selectedIndexes) {
  const checkbox = benefitItems.nth(index);
  
  // Only click if not already selected
  const isChecked = await checkbox.getAttribute('aria-checked');
  if (isChecked !== 'true') {
    await checkbox.click();
    console.log(`Selected benefit #${index + 1}`);
  } else {
    console.log(`Benefit #${index + 1} already selected, skipping`);
  }
}

// ✅ Optional: close dropdown
await benefitsDropdown.press('Escape');
await page.waitForTimeout(500);
console.log('Random benefits selected successfully ✅');

// --- 1️⃣ Fill LinkedIn first ---
const linkedinInput = page.locator('input[name="digital_presence.0.value"]');
const randomLinkedIn = `https://www.linkedin.com/in/${Math.random().toString(36).substring(2,12)}`;
await linkedinInput.fill(randomLinkedIn);
console.log(`Entered LinkedIn: ${randomLinkedIn}`);

// Click "Add New" to create a new digital presence row
const addNewBtn = page.locator('button', { hasText: 'Add New' });
await addNewBtn.click();
console.log('Clicked Add New for next digital presence');

// --- 2️⃣ Fill Glassdoor link in the new row ---
const glassdoorInput = page.locator('input[name="digital_presence.1.value"]');
const randomGlassdoor = `https://www.glassdoor.com/profile/${Math.random().toString(36).substring(2,12)}`;
await glassdoorInput.fill(randomGlassdoor);
console.log(`Entered Glassdoor: ${randomGlassdoor}`);

// --- 3️⃣ Click "Add New" for Facebook ---
await addNewBtn.click();
console.log('Clicked Add New for Facebook');

// --- Fill Facebook link ---
const facebookInput = page.locator('input[name="digital_presence.2.value"]');
const randomFacebook = `https://www.facebook.com/${Math.random().toString(36).substring(2,12)}`;
await facebookInput.fill(randomFacebook);
console.log(`Entered Facebook: ${randomFacebook}`);

// --- 4️⃣ Click "Add New" for Instagram ---
await addNewBtn.click();
console.log('Clicked Add New for Instagram');

// --- Fill Instagram link ---
const instagramInput = page.locator('input[name="digital_presence.3.value"]');
const randomInstagram = `https://www.instagram.com/${Math.random().toString(36).substring(2,12)}`;
await instagramInput.fill(randomInstagram);
console.log(`Entered Instagram: ${randomInstagram}`);

// --- 5️⃣ Click "Add New" for X ---
await addNewBtn.click();
console.log('Clicked Add New for X');

// --- Fill X link ---
const xInput = page.locator('input[name="digital_presence.4.value"]');
const randomX = `https://twitter.com/${Math.random().toString(36).substring(2,12)}`;
await xInput.fill(randomX);
console.log(`Entered X link: ${randomX}`);

// --- 6️⃣ Click "Add New" for YouTube ---
await addNewBtn.click();
console.log('Clicked Add New for YouTube');

// --- Fill YouTube link ---
const youtubeInput = page.locator('input[name="digital_presence.5.value"]');
const randomYouTube = `https://www.youtube.com/channel/${Math.random().toString(36).substring(2,12)}`;
await youtubeInput.fill(randomYouTube);
console.log(`Entered YouTube link: ${randomYouTube}`);

// Locate the Theme label
const themeLabel = page.locator('label', { hasText: 'Theme' });
await expect(themeLabel).toBeVisible();

// Get radiogroup ID from label's "for" attribute
const radioGroupId = await themeLabel.getAttribute('for');

// Locate the exact radiogroup using that ID
const radioGroup = page.locator(`#${radioGroupId}`);
await expect(radioGroup).toBeVisible();

// Get radio buttons (Light / Dark only)
const radios = radioGroup.locator('button[role="radio"]');
const count6 = await radios.count(); // should be 2

// Pick random radio
const randomIndex = Math.floor(Math.random() * count6);
await radios.nth(randomIndex).click();

// Log selected theme
const selectedTheme = await radios.nth(randomIndex).getAttribute('value');
console.log(`✅ Random theme selected: ${selectedTheme}`);


// Locate "Remove Branding" label
const removeBrandingLabel = page.locator('label', { hasText: 'Remove Branding' });
await expect(removeBrandingLabel).toBeVisible();

// Get the radiogroup id from label's "for"
const radioGroupId2 = await removeBrandingLabel.getAttribute('for');

// Locate the exact radiogroup
const removeBrandingGroup = page.locator(`#${radioGroupId2}`);
await expect(removeBrandingGroup).toBeVisible();

// Get radio buttons (Yes / No)
const radios2 = removeBrandingGroup.locator('button[role="radio"]');
const count7 = await radios2.count(); // should be 2

// Pick random option
const randomIndex2 = Math.floor(Math.random() * count7);
const selectedRadio = radios2.nth(randomIndex2);

// Click it
await selectedRadio.click();

// Log selected value
const selectedValue = await selectedRadio.getAttribute('value');
console.log(`✅ Remove Branding selected: ${selectedValue}`);
        
const colorInputs = page.locator('input[type="color"]');

const colorPickers = page.locator('input[type="color"]');
const count3 = await colorPickers.count();

for (let i = 0; i < count3; i++) {
  const picker = colorPickers.nth(i);

  const randomColor =
    '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

  await picker.scrollIntoViewIfNeeded();

  // This is CRITICAL
  await picker.fill(randomColor);   // <-- real browser event
  await picker.blur();              // <-- commit change

  console.log(`🎨 Color picker ${i + 1} set to ${randomColor}`);
}


// Click the Publish button
const publishBtn = page.locator('button[type="submit"]', { hasText: 'Publish' });
await publishBtn.click();

await page.waitForTimeout(4000);
console.log('Clicked on Publish button');
// Wait for UI to stabilize after uploads
await page.waitForLoadState('networkidle');
});