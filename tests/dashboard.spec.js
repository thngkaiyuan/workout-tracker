import { test, expect } from '@playwright/test';

test.describe('Dashboard & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('displays current day correctly', async ({ page }) => {
    await page.goto('/');
    
    // Get current day name
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = dayNames[new Date().getDay()];
    
    // Check "Today is X" is displayed
    await expect(page.locator('text=Today is')).toContainText(`Today is ${today}`);
  });

  test('shows "no workout planned" when no plans exist', async ({ page }) => {
    await page.goto('/');
    
    // Should show no workout planned message
    await expect(page.locator('text=No workout planned for today')).toBeVisible();
    
    // Should show "Create a Plan" button
    await expect(page.locator('button:has-text("Create a Plan")')).toBeVisible();
    
    // Should show empty plans message
    await expect(page.locator('text=No plans created yet')).toBeVisible();
  });

  test('shows today\'s workout when plan exists for current day', async ({ page }) => {
    // Create a plan for today
    const today = new Date().getDay();
    const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today];
    
    await page.goto('/');
    
    // Navigate to create plan
    await page.click('button:has-text("Add New Plan")');
    
    // Fill out plan form
    await page.fill('input[data-field="newPlanName"]', 'Push Day');
    await page.selectOption('select[data-field="newPlanDay"]', today.toString());
    
    // Add an exercise
    await page.fill('input[data-field="newExerciseName"]', 'Push-ups');
    await page.click('button[data-action="add-exercise"]');
    
    // Save plan
    await page.click('button[data-action="save-plan"]');
    
    // Should now show today's workout
    await expect(page.locator('text=Today\'s Workout')).toBeVisible();
    await expect(page.locator('.gradient-green').locator('text=Push Day')).toBeVisible();
    await expect(page.locator('.gradient-green').locator('button:has-text("Start")')).toBeVisible();
  });

  test('clicking workout plan shows plan history', async ({ page }) => {
    // Create a plan first
    await page.goto('/');
    await page.click('button:has-text("Add New Plan")');
    
    await page.fill('input[data-field="newPlanName"]', 'Test Plan');
    await page.fill('input[data-field="newExerciseName"]', 'Squats');
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    
    // Click on the plan name (not the Start button)
    await page.click('[data-action="view-plan-history"]');
    
    // Should navigate to plan history page
    await expect(page.locator('.gradient-bg h1')).toContainText('Test Plan');
    await expect(page.locator('h3:has-text("Plan Overview")')).toBeVisible();
    await expect(page.locator('h3:has-text("Workout History")')).toBeVisible();
    await expect(page.locator('text=No workouts recorded for this plan yet')).toBeVisible();
  });

  test('start button on workout plan works', async ({ page }) => {
    // Create a plan first
    await page.goto('/');
    await page.click('button:has-text("Add New Plan")');
    
    await page.fill('input[data-field="newPlanName"]', 'Workout Test');
    await page.fill('input[data-field="newExerciseName"]', 'Bench Press');
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    
    // Click Start button
    await page.click('button[data-action="start-workout"]');
    
    // Should navigate to workout screen
    await expect(page.locator('.gradient-green').locator('text=Workout Test')).toBeVisible();
    await expect(page.locator('h2:has-text("Bench Press")')).toBeVisible();
    await expect(page.locator('text=Set 1 of')).toBeVisible();
    await expect(page.locator('button:has-text("Complete Set")')).toBeVisible();
  });

  test('has add new plan button that works', async ({ page }) => {
    await page.goto('/');
    
    // Should show "Add New Plan" button
    await expect(page.locator('button:has-text("Add New Plan")')).toBeVisible();
    
    // Clicking it should navigate to create plan page
    await page.click('button:has-text("Add New Plan")');
    
    // Should be on create plan page
    await expect(page.locator('text=Create New Plan')).toBeVisible();
    await expect(page.locator('input[data-field="newPlanName"]')).toBeVisible();
    await expect(page.locator('select[data-field="newPlanDay"]')).toBeVisible();
  });

  test('shows all created workout plans in list', async ({ page }) => {
    await page.goto('/');
    
    // Create multiple plans
    const plans = [
      { name: 'Push Day', day: '1', exercise: 'Push-ups' },
      { name: 'Pull Day', day: '2', exercise: 'Pull-ups' },
      { name: 'Leg Day', day: '3', exercise: 'Squats' }
    ];
    
    for (const plan of plans) {
      await page.click('button:has-text("Add New Plan")');
      await page.fill('input[data-field="newPlanName"]', plan.name);
      await page.selectOption('select[data-field="newPlanDay"]', plan.day);
      await page.fill('input[data-field="newExerciseName"]', plan.exercise);
      await page.click('button[data-action="add-exercise"]');
      await page.click('button[data-action="save-plan"]');
    }
    
    // All plans should be visible
    await expect(page.locator('text=Push Day')).toBeVisible();
    await expect(page.locator('text=Pull Day')).toBeVisible();
    await expect(page.locator('text=Leg Day')).toBeVisible();
    
    // Each should have a Start button
    const startButtons = page.locator('button:has-text("Start")');
    await expect(startButtons).toHaveCount(3);
  });

  test('back navigation works correctly', async ({ page }) => {
    // Create a plan first
    await page.goto('/');
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Back Test');
    await page.fill('input[data-field="newExerciseName"]', 'Test Exercise');
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    
    // Navigate to plan history
    await page.click('[data-action="view-plan-history"]');
    await expect(page.locator('text=Plan Overview')).toBeVisible();
    
    // Click back button
    await page.click('button[data-action="navigate"][data-id="dashboard"]');
    
    // Should be back on dashboard
    await expect(page.locator('text=Workout Tracker')).toBeVisible();
    await expect(page.locator('text=All Workout Plans')).toBeVisible();
  });
});