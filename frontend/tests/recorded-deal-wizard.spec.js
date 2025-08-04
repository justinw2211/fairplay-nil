import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://fairplay-nil.vercel.app/');
  await page.getByRole('link', { name: 'Log In' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('testuser');
  await page.getByRole('textbox', { name: 'Email Address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).dblclick();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('test');
});