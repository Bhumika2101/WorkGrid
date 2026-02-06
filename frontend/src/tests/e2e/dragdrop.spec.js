import { test, expect } from '@playwright/test';

test.describe('Drag and Drop E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="connection-status"]');
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });
    
    // Create a test task
    await page.click('[data-testid="add-task-btn"]');
    await page.fill('[data-testid="task-title-input"]', 'Drag Test Task');
    await page.click('[data-testid="submit-task-btn"]');
    await expect(page.locator('text=Drag Test Task')).toBeVisible();
  });

  test('should drag task from To Do to In Progress', async ({ page }) => {
    // Get the task card
    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Drag Test Task' });
    
    // Get the destination column
    const inProgressColumn = page.locator('[data-testid="droppable-inprogress"]');
    
    // Perform drag and drop
    await taskCard.dragTo(inProgressColumn);
    
    // Verify task is now in In Progress column
    await expect(inProgressColumn.locator('text=Drag Test Task')).toBeVisible();
  });

  test('should drag task from To Do to Done', async ({ page }) => {
    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Drag Test Task' });
    const doneColumn = page.locator('[data-testid="droppable-done"]');
    
    await taskCard.dragTo(doneColumn);
    
    await expect(doneColumn.locator('text=Drag Test Task')).toBeVisible();
  });

  test('should move task back from Done to To Do', async ({ page }) => {
    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Drag Test Task' });
    const doneColumn = page.locator('[data-testid="droppable-done"]');
    const todoColumn = page.locator('[data-testid="droppable-todo"]');
    
    // Move to Done
    await taskCard.dragTo(doneColumn);
    await expect(doneColumn.locator('text=Drag Test Task')).toBeVisible();
    
    // Move back to To Do
    const movedCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Drag Test Task' });
    await movedCard.dragTo(todoColumn);
    
    await expect(todoColumn.locator('text=Drag Test Task')).toBeVisible();
  });

  test('should update column task count after drag', async ({ page }) => {
    const todoColumn = page.locator('[data-testid="column-todo"]');
    const inProgressColumn = page.locator('[data-testid="column-inprogress"]');
    
    // Get initial counts
    const initialTodoCount = await todoColumn.locator('.rounded-full').textContent();
    
    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Drag Test Task' });
    const inProgressDroppable = page.locator('[data-testid="droppable-inprogress"]');
    
    await taskCard.dragTo(inProgressDroppable);
    
    // Verify counts updated
    await page.waitForTimeout(500); // Wait for UI update
    const newTodoCount = await todoColumn.locator('.rounded-full').textContent();
    const newInProgressCount = await inProgressColumn.locator('.rounded-full').textContent();
    
    expect(parseInt(newTodoCount)).toBe(parseInt(initialTodoCount) - 1);
  });
});
