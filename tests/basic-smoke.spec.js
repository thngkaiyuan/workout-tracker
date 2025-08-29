import { test, expect } from '@playwright/test';

test.describe('Basic Smoke Tests', () => {
  test('app loads and shows title', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads
    await expect(page).toHaveTitle('Workout Tracker');
    
    // Check that main app container exists
    await expect(page.locator('#app')).toBeVisible();
    
    // Check that the main heading is present
    await expect(page.locator('h1')).toContainText('Workout Tracker');
  });

  test('app is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Should still show the main heading
    await expect(page.locator('h1')).toContainText('Workout Tracker');
    
    // App container should be visible
    await expect(page.locator('#app')).toBeVisible();
  });
});