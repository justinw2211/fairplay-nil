const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.locator('body').click();
  await page.goto('https://fairplay-nil.vercel.app/');
  await page.locator('.chakra-stack.css-1fchixb').first().click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('textbox', { name: 'Deal Nickname *' }).click();
  await page.getByRole('textbox', { name: 'Deal Nickname *' }).fill('test');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Business', { exact: true }).click();
  await page.getByRole('radio', { name: 'Business' }).press('t');
  await page.getByRole('textbox', { name: 'Payor\'s Full Name or Company' }).click();
  await page.getByRole('textbox', { name: 'Payor\'s Full Name or Company' }).fill('test');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('div').filter({ hasText: /^Social MediaPhotos or videos posted to your personal social media account$/ }).nth(1).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('.css-1y85o3r').first().click();
  await page.locator('div').filter({ hasText: /^Stories0$/ }).getByRole('button').nth(1).dblclick();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('group').filter({ hasText: '1. In addition to your' }).locator('div').nth(3).click();
  await page.getByRole('group').filter({ hasText: '2. Will your school\'s brand' }).locator('div').nth(3).click();
  await page.getByRole('group').filter({ hasText: '3. Will you be granting any' }).locator('div').nth(3).click();
  await page.getByRole('group').filter({ hasText: '4. Does this deal conflict' }).locator('div').nth(3).click();
  await page.getByRole('group').filter({ hasText: '5. Is a professional' }).locator('div').nth(3).click();
  await page.getByRole('group').filter({ hasText: '6. Are there any restricted' }).locator('div').nth(3).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('group').filter({ hasText: '1. In addition to your' }).locator('div').nth(3).click();
  await page.getByRole('group').filter({ hasText: '2. Will your school\'s brand' }).locator('div').nth(3).click();
  await page.getByRole('group').filter({ hasText: '3. Will you be granting any' }).locator('div').nth(3).click();
  await page.getByRole('group').filter({ hasText: '4. Does this deal conflict' }).locator('div').nth(3).click();
  await page.getByRole('group').filter({ hasText: '5. Is a professional' }).locator('div').nth(3).click();
  await page.getByRole('group').filter({ hasText: '6. Are there any restricted' }).locator('div').nth(3).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();