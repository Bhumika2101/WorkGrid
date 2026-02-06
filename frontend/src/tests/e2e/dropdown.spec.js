import { test, expect } from '@playwright/test';

test.describe('Priority and Category Selection E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="connection-status"]');
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });
  });

  test.describe('Priority Selection', () => {
    test('should set task priority to Low', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Low Priority Task');
      
      // Open priority dropdown
      await page.click('.react-select-container >> nth=0');
      await page.click('text=Low');
      
      await page.click('[data-testid="submit-task-btn"]');
      
      // Verify task has low priority badge
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Low Priority Task' });
      await expect(taskCard.locator('[data-testid^="task-priority-"]')).toHaveText('low');
    });

    test('should set task priority to High', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'High Priority Task');
      
      // Open priority dropdown
      await page.click('.react-select-container >> nth=0');
      await page.click('text=High');
      
      await page.click('[data-testid="submit-task-btn"]');
      
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'High Priority Task' });
      await expect(taskCard.locator('[data-testid^="task-priority-"]')).toHaveText('high');
    });

    test('should update task priority in edit mode', async ({ page }) => {
      // Create task
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Priority Change Task');
      await page.click('[data-testid="submit-task-btn"]');
      
      // Edit task
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Priority Change Task' });
      await taskCard.locator('[data-testid^="edit-task-"]').click();
      
      // Change priority to High
      await page.click('.react-select-container >> nth=0');
      await page.click('text=High');
      
      await page.click('[data-testid="submit-task-btn"]');
      
      // Verify updated priority
      const updatedCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Priority Change Task' });
      await expect(updatedCard.locator('[data-testid^="task-priority-"]')).toHaveText('high');
    });
  });

  test.describe('Category Selection', () => {
    test('should set task category to Bug', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Bug Task');
      
      // Open category dropdown (second select)
      await page.click('.react-select-container >> nth=1');
      await page.click('text=Bug');
      
      await page.click('[data-testid="submit-task-btn"]');
      
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Bug Task' });
      await expect(taskCard.locator('[data-testid^="task-category-"]')).toHaveText('bug');
    });

    test('should set task category to Enhancement', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Enhancement Task');
      
      await page.click('.react-select-container >> nth=1');
      await page.click('text=Enhancement');
      
      await page.click('[data-testid="submit-task-btn"]');
      
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Enhancement Task' });
      await expect(taskCard.locator('[data-testid^="task-category-"]')).toHaveText('enhancement');
    });

    test('should update task category in edit mode', async ({ page }) => {
      // Create task
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Category Change Task');
      await page.click('[data-testid="submit-task-btn"]');
      
      // Edit task
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Category Change Task' });
      await taskCard.locator('[data-testid^="edit-task-"]').click();
      
      // Change category to Bug
      await page.click('.react-select-container >> nth=1');
      await page.click('text=Bug');
      
      await page.click('[data-testid="submit-task-btn"]');
      
      // Verify updated category
      const updatedCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Category Change Task' });
      await expect(updatedCard.locator('[data-testid^="task-category-"]')).toHaveText('bug');
    });
  });

  test.describe('Column Selection', () => {
    test('should create task directly in In Progress column', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'In Progress Task');
      
      // Open column dropdown (third select)
      await page.click('.react-select-container >> nth=2');
      await page.click('text=In Progress');
      
      await page.click('[data-testid="submit-task-btn"]');
      
      const inProgressColumn = page.locator('[data-testid="droppable-inprogress"]');
      await expect(inProgressColumn.locator('text=In Progress Task')).toBeVisible();
    });

    test('should create task directly in Done column', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Done Task');
      
      await page.click('.react-select-container >> nth=2');
      await page.click('text=Done');
      
      await page.click('[data-testid="submit-task-btn"]');
      
      const doneColumn = page.locator('[data-testid="droppable-done"]');
      await expect(doneColumn.locator('text=Done Task')).toBeVisible();
    });
  });
});
