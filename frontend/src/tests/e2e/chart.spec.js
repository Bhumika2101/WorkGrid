import { test, expect } from '@playwright/test';

test.describe('Progress Chart E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="connection-status"]');
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });
  });

  test.describe('Chart Display', () => {
    test('should display progress chart by default', async ({ page }) => {
      await expect(page.locator('[data-testid="progress-chart"]')).toBeVisible();
    });

    test('should display bar chart', async ({ page }) => {
      await expect(page.locator('[data-testid="bar-chart"]')).toBeVisible();
    });

    test('should display pie chart', async ({ page }) => {
      await expect(page.locator('[data-testid="pie-chart"]')).toBeVisible();
    });

    test('should display task statistics', async ({ page }) => {
      await expect(page.locator('[data-testid="stat-todo"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-inprogress"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-done"]')).toBeVisible();
    });

    test('should display total tasks count', async ({ page }) => {
      await expect(page.locator('text=Total Tasks:')).toBeVisible();
    });

    test('should display completion percentage', async ({ page }) => {
      await expect(page.locator('text=Completion:')).toBeVisible();
    });
  });

  test.describe('Chart Toggle', () => {
    test('should hide chart when toggle button is clicked', async ({ page }) => {
      await expect(page.locator('[data-testid="progress-chart"]')).toBeVisible();
      
      await page.click('[data-testid="toggle-chart-btn"]');
      
      await expect(page.locator('[data-testid="progress-chart"]')).not.toBeVisible();
    });

    test('should show chart when toggle button is clicked again', async ({ page }) => {
      // Hide chart
      await page.click('[data-testid="toggle-chart-btn"]');
      await expect(page.locator('[data-testid="progress-chart"]')).not.toBeVisible();
      
      // Show chart
      await page.click('[data-testid="toggle-chart-btn"]');
      await expect(page.locator('[data-testid="progress-chart"]')).toBeVisible();
    });
  });

  test.describe('Chart Updates', () => {
    test('should update chart when task is added', async ({ page }) => {
      // Get initial todo count
      const initialTodoStat = await page.locator('[data-testid="stat-todo"]').textContent();
      const initialCount = parseInt(initialTodoStat.match(/\d+/)?.[0] || '0');
      
      // Add a task
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'New Task for Chart');
      await page.click('[data-testid="submit-task-btn"]');
      
      // Wait for chart to update
      await page.waitForTimeout(500);
      
      // Verify count increased
      const newTodoStat = await page.locator('[data-testid="stat-todo"]').textContent();
      const newCount = parseInt(newTodoStat.match(/\d+/)?.[0] || '0');
      
      expect(newCount).toBe(initialCount + 1);
    });

    test('should update chart when task is moved', async ({ page }) => {
      // Create a task
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Task to Move for Chart');
      await page.click('[data-testid="submit-task-btn"]');
      
      await expect(page.locator('text=Task to Move for Chart')).toBeVisible();
      
      // Get initial counts
      const initialTodoStat = await page.locator('[data-testid="stat-todo"]').textContent();
      const initialTodoCount = parseInt(initialTodoStat.match(/\d+/)?.[0] || '0');
      
      const initialDoneStat = await page.locator('[data-testid="stat-done"]').textContent();
      const initialDoneCount = parseInt(initialDoneStat.match(/\d+/)?.[0] || '0');
      
      // Move task to done
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Task to Move for Chart' });
      const doneColumn = page.locator('[data-testid="droppable-done"]');
      
      await taskCard.dragTo(doneColumn);
      
      // Wait for chart to update
      await page.waitForTimeout(500);
      
      // Verify counts changed
      const newTodoStat = await page.locator('[data-testid="stat-todo"]').textContent();
      const newTodoCount = parseInt(newTodoStat.match(/\d+/)?.[0] || '0');
      
      const newDoneStat = await page.locator('[data-testid="stat-done"]').textContent();
      const newDoneCount = parseInt(newDoneStat.match(/\d+/)?.[0] || '0');
      
      expect(newTodoCount).toBe(initialTodoCount - 1);
      expect(newDoneCount).toBe(initialDoneCount + 1);
    });

    test('should update completion percentage when task is moved to done', async ({ page }) => {
      // Create a task
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Task for Completion');
      await page.click('[data-testid="submit-task-btn"]');
      
      // Move task to done
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Task for Completion' });
      const doneColumn = page.locator('[data-testid="droppable-done"]');
      
      await taskCard.dragTo(doneColumn);
      
      // Verify completion percentage is shown (should be greater than 0)
      await page.waitForTimeout(500);
      const completionText = await page.locator('text=Completion:').locator('..').textContent();
      
      // The completion percentage should exist
      expect(completionText).toMatch(/\d+%/);
    });

    test('should update chart when task is deleted', async ({ page }) => {
      // Create a task
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Task to Delete for Chart');
      await page.click('[data-testid="submit-task-btn"]');
      
      await expect(page.locator('text=Task to Delete for Chart')).toBeVisible();
      
      // Get initial todo count
      const initialTodoStat = await page.locator('[data-testid="stat-todo"]').textContent();
      const initialCount = parseInt(initialTodoStat.match(/\d+/)?.[0] || '0');
      
      // Delete task
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Task to Delete for Chart' });
      await taskCard.locator('[data-testid^="delete-task-"]').click();
      await taskCard.locator('[data-testid^="confirm-delete-"]').click();
      
      // Wait for chart to update
      await page.waitForTimeout(500);
      
      // Verify count decreased
      const newTodoStat = await page.locator('[data-testid="stat-todo"]').textContent();
      const newCount = parseInt(newTodoStat.match(/\d+/)?.[0] || '0');
      
      expect(newCount).toBe(initialCount - 1);
    });
  });
});
