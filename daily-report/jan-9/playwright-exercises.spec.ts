import { test, expect } from '@playwright/test';

test('User can add products and see the total amount', async ({ page }) => {
  // E2E test draft
  console.log('Playwright test template is ready. Update the URL and selectors to match your application.');
});

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Get started' }).click();
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
