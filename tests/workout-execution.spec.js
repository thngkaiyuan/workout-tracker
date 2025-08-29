import { test, expect } from '@playwright/test';

test.describe('Workout Execution Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('can start a rep-based workout and see exercise details', async ({ page }) => {
    await page.goto('/');
    
    // Create a plan with rep-based exercise
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Rep Workout');
    await page.fill('input[data-field="newExerciseName"]', 'Bench Press');
    await page.selectOption('select[data-field="newExerciseType"]', 'reps');
    await page.fill('input[data-field="newExerciseSets"]', '3');
    await page.fill('input[data-field="newExerciseReps"]', '10');
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    
    // Start the workout
    await page.click('button[data-action="start-workout"]');
    
    // Should be on workout execution screen
    await expect(page.locator('.gradient-green h1:has-text("Rep Workout")')).toBeVisible();
    await expect(page.locator('h2:has-text("Bench Press")')).toBeVisible();
    await expect(page.locator('text=Set 1 of 3')).toBeVisible();
    await expect(page.locator('button[data-action="complete-set"]')).toBeVisible();
    await expect(page.locator('button:has-text("Complete Set")')).toBeVisible();
    
    // Should show progress bar
    await expect(page.locator('.bg-green-700.rounded-full')).toBeVisible();
    await expect(page.locator('text=0% Complete')).toBeVisible();
    
    // Should show rep and weight controls
    await expect(page.locator('text=Reps')).toBeVisible();
    await expect(page.locator('text=Weight (lbs)')).toBeVisible();
  });

  test('can start a time-based workout and see timer', async ({ page }) => {
    await page.goto('/');
    
    // Create a plan with time-based exercise
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Timer Workout');
    await page.fill('input[data-field="newExerciseName"]', 'Plank');
    await page.selectOption('select[data-field="newExerciseType"]', 'time');
    await page.fill('input[data-field="newExerciseSets"]', '2');
    await page.fill('input[data-field="newExerciseDuration"]', '30');
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    
    // Start the workout
    await page.click('button[data-action="start-workout"]');
    
    // Should be on workout execution screen with timer
    await expect(page.locator('.gradient-green h1:has-text("Timer Workout")')).toBeVisible();
    await expect(page.locator('h2:has-text("Plank")')).toBeVisible();
    await expect(page.locator('text=Set 1 of 2')).toBeVisible();
    
    // Should show timer UI
    await expect(page.locator('text=Record: 30s')).toBeVisible();
    await expect(page.locator('button[data-action="start-timer"]')).toBeVisible();
    await expect(page.locator('button:has-text("Start")')).toBeVisible();
    
    // Should not show rep/weight controls
    await expect(page.locator('text=Reps')).not.toBeVisible();
    await expect(page.locator('text=Weight (lbs)')).not.toBeVisible();
  });

  test('can complete a set in rep-based exercise', async ({ page }) => {
    await page.goto('/');
    
    // Create simple workout
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Simple Workout');
    await page.fill('input[data-field="newExerciseName"]', 'Push-ups');
    await page.fill('input[data-field="newExerciseSets"]', '2');
    await page.fill('input[data-field="newExerciseReps"]', '5');
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    
    // Start workout and complete first set
    await page.click('button[data-action="start-workout"]');
    await expect(page.locator('text=Set 1 of 2')).toBeVisible();
    
    // Complete the first set
    await page.click('button[data-action="complete-set"]');
    
    // Should advance to set 2
    await expect(page.locator('text=Set 2 of 2')).toBeVisible();
    await expect(page.locator('h2:has-text("Push-ups")')).toBeVisible();
    
    // Progress should have increased
    await expect(page.locator('text=50% Complete')).toBeVisible();
  });

  test('can complete multiple exercises in sequence', async ({ page }) => {
    await page.goto('/');
    
    // Create workout with multiple exercises
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Multi Exercise');
    
    // Add first exercise
    await page.fill('input[data-field="newExerciseName"]', 'Exercise A');
    await page.fill('input[data-field="newExerciseSets"]', '1');
    await page.click('button[data-action="add-exercise"]');
    
    // Add second exercise
    await page.fill('input[data-field="newExerciseName"]', 'Exercise B');
    await page.fill('input[data-field="newExerciseSets"]', '1');
    await page.click('button[data-action="add-exercise"]');
    
    await page.click('button[data-action="save-plan"]');
    
    // Start workout
    await page.click('button[data-action="start-workout"]');
    
    // Should start with Exercise A
    await expect(page.locator('h2:has-text("Exercise A")')).toBeVisible();
    await expect(page.locator('text=Set 1 of 1')).toBeVisible();
    
    // Complete Exercise A
    await page.click('button[data-action="complete-set"]');
    
    // Should advance to Exercise B
    await expect(page.locator('h2:has-text("Exercise B")')).toBeVisible();
    await expect(page.locator('text=Set 1 of 1')).toBeVisible();
    await expect(page.locator('text=50% Complete')).toBeVisible();
  });

  test('shows remaining exercises list', async ({ page }) => {
    await page.goto('/');
    
    // Create workout with 3 exercises
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Three Exercise Workout');
    
    const exercises = ['Squats', 'Push-ups', 'Lunges'];
    for (const exercise of exercises) {
      await page.fill('input[data-field="newExerciseName"]', exercise);
      await page.fill('input[data-field="newExerciseSets"]', '1');
      await page.click('button[data-action="add-exercise"]');
    }
    
    await page.click('button[data-action="save-plan"]');
    await page.click('button[data-action="start-workout"]');
    
    // Should show remaining exercises section
    await expect(page.locator('h3:has-text("Remaining Exercises")')).toBeVisible();
    
    // Should show all exercises initially (being more specific with selectors)
    await expect(page.locator('.bg-white .space-y-1 .flex:has-text("Squats")')).toBeVisible();
    await expect(page.locator('.bg-white .space-y-1 .flex:has-text("Push-ups")')).toBeVisible();
    await expect(page.locator('.bg-white .space-y-1 .flex:has-text("Lunges")')).toBeVisible();
  });

  test('can adjust reps and weight values', async ({ page }) => {
    await page.goto('/');
    
    // Create workout with rep-based exercise
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Adjustment Test');
    await page.fill('input[data-field="newExerciseName"]', 'Deadlifts');
    await page.fill('input[data-field="newExerciseSets"]', '1');
    await page.fill('input[data-field="newExerciseReps"]', '8');
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    
    await page.click('button[data-action="start-workout"]');
    
    // Should have controls for reps and weight
    await expect(page.locator('text=Reps')).toBeVisible();
    await expect(page.locator('text=Weight (lbs)')).toBeVisible();
    
    // Should have + and - buttons for adjustments (using data-id for increment values)
    await expect(page.locator('button[data-action="update-reps"][data-id="1"]')).toBeVisible();
    await expect(page.locator('button[data-action="update-reps"][data-id="-1"]')).toBeVisible();
    await expect(page.locator('button[data-action="update-weight"][data-id="1"]')).toBeVisible();
    await expect(page.locator('button[data-action="update-weight"][data-id="-1"]')).toBeVisible();
    
    // Should have input fields for direct entry
    await expect(page.locator('input[data-field="currentReps"]')).toBeVisible();
    await expect(page.locator('input[data-field="currentWeight"]')).toBeVisible();
  });

  test('can save and exit workout', async ({ page }) => {
    await page.goto('/');
    
    // Create simple workout
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Save Test');
    await page.fill('input[data-field="newExerciseName"]', 'Test Exercise');
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    
    await page.click('button[data-action="start-workout"]');
    
    // Should have save and exit option
    await expect(page.locator('button[data-action="save-and-exit"]')).toBeVisible();
    await expect(page.locator('button:has-text("Save & Exit")')).toBeVisible();
    
    // Click save and exit
    await page.click('button[data-action="save-and-exit"]');
    
    // Should return to dashboard
    await page.waitForTimeout(500);
    await expect(page.locator('text=Workout Tracker')).toBeVisible();
  });

  test('can finish workout early', async ({ page }) => {
    await page.goto('/');
    
    // Create simple workout
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Early Finish Test');
    await page.fill('input[data-field="newExerciseName"]', 'Test Exercise');
    await page.fill('input[data-field="newExerciseSets"]', '5'); // More sets to finish early
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    
    await page.click('button[data-action="start-workout"]');
    
    // Should have finish early option
    await expect(page.locator('button[data-action="finish-early"]')).toBeVisible();
    await expect(page.locator('button:has-text("Finish Early")')).toBeVisible();
    
    // Click finish early
    await page.click('button[data-action="finish-early"]');
    
    // Should return to dashboard
    await page.waitForTimeout(500);
    await expect(page.locator('text=Workout Tracker')).toBeVisible();
  });

  test('can navigate back to dashboard during workout', async ({ page }) => {
    await page.goto('/');
    
    // Create and start workout
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Navigation Test');
    await page.fill('input[data-field="newExerciseName"]', 'Test Exercise');
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    await page.click('button[data-action="start-workout"]');
    
    // Should have back button
    await expect(page.locator('button[data-action="navigate"][data-id="dashboard"]')).toBeVisible();
    
    // Click back button
    await page.click('button[data-action="navigate"][data-id="dashboard"]');
    
    // Should return to dashboard
    await expect(page.locator('text=Workout Tracker')).toBeVisible();
  });

  test('timer can be started and stopped for time-based exercises', async ({ page }) => {
    await page.goto('/');
    
    // Create time-based workout
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Timer Test');
    await page.fill('input[data-field="newExerciseName"]', 'Wall Sit');
    await page.selectOption('select[data-field="newExerciseType"]', 'time');
    await page.fill('input[data-field="newExerciseSets"]', '1');
    await page.fill('input[data-field="newExerciseDuration"]', '20');
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    
    await page.click('button[data-action="start-workout"]');
    
    // Should show start timer button
    await expect(page.locator('button[data-action="start-timer"]')).toBeVisible();
    
    // Start the timer
    await page.click('button[data-action="start-timer"]');
    
    // Should now show stop timer button
    await expect(page.locator('button[data-action="stop-timer"]')).toBeVisible();
    await expect(page.locator('button:has-text("Done")')).toBeVisible();
    
    // Timer display should be visible
    await expect(page.locator('.text-6xl.font-bold')).toBeVisible();
  });

  test('displays correct progress percentage through workout', async ({ page }) => {
    await page.goto('/');
    
    // Create workout with known structure for progress calculation
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Progress Test');
    await page.fill('input[data-field="newExerciseName"]', 'Exercise');
    await page.fill('input[data-field="newExerciseSets"]', '4'); // 4 sets = 25% per set
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    
    await page.click('button[data-action="start-workout"]');
    
    // Should start at 0%
    await expect(page.locator('text=0% Complete')).toBeVisible();
    
    // Complete first set - should be 25%
    await page.click('button[data-action="complete-set"]');
    await expect(page.locator('text=25% Complete')).toBeVisible();
    
    // Complete second set - should be 50%
    await page.click('button[data-action="complete-set"]');
    await expect(page.locator('text=50% Complete')).toBeVisible();
    
    // Complete third set - should be 75%
    await page.click('button[data-action="complete-set"]');
    await expect(page.locator('text=75% Complete')).toBeVisible();
  });

  test('workout completes and returns to dashboard after final set', async ({ page }) => {
    await page.goto('/');
    
    // Create minimal workout
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Complete Test');
    await page.fill('input[data-field="newExerciseName"]', 'Final Exercise');
    await page.fill('input[data-field="newExerciseSets"]', '1'); // Just one set
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    
    await page.click('button[data-action="start-workout"]');
    
    // Should be in workout
    await expect(page.locator('h2:has-text("Final Exercise")')).toBeVisible();
    
    // Complete the final set
    await page.click('button[data-action="complete-set"]');
    
    // Should return to dashboard after completing workout (wait a bit for navigation)
    await page.waitForTimeout(500);
    await expect(page.locator('text=Workout Tracker')).toBeVisible();
  });

  // TODO: Fix and add plus/minus button functionality tests
  // The handlers might not be properly connected in the test environment

  test('can type directly into reps and weight inputs', async ({ page }) => {
    await page.goto('/');
    
    // Create workout
    await page.click('button:has-text("Add New Plan")');
    await page.fill('input[data-field="newPlanName"]', 'Input Test');
    await page.fill('input[data-field="newExerciseName"]', 'Bench Press');
    await page.fill('input[data-field="newExerciseSets"]', '1');
    await page.click('button[data-action="add-exercise"]');
    await page.click('button[data-action="save-plan"]');
    
    await page.click('button[data-action="start-workout"]');
    
    // Clear and type new values
    const repsInput = page.locator('input[data-field="currentReps"]');
    await repsInput.fill('15');
    await expect(repsInput).toHaveValue('15');
    
    const weightInput = page.locator('input[data-field="currentWeight"]');
    await weightInput.fill('135');
    await expect(weightInput).toHaveValue('135');
  });

  // TODO: Add comprehensive smart prepopulation tests
  // These tests verify that the app remembers reps/weight values
  // for each exercise name across different workout plans
});