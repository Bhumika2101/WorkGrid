import { test, expect } from '@playwright/test';

test.describe('Kanban Board E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for WebSocket connection
    await page.waitForSelector('[data-testid="connection-status"]');
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });
  });

  test.describe('Board Loading', () => {
    test('should load the Kanban board', async ({ page }) => {
      await expect(page.locator('h1:has-text("Kanban Board")')).toBeVisible();
    });

    test('should display all three columns', async ({ page }) => {
      await expect(page.locator('[data-testid="column-todo"]')).toBeVisible();
      await expect(page.locator('[data-testid="column-inprogress"]')).toBeVisible();
      await expect(page.locator('[data-testid="column-done"]')).toBeVisible();
    });

    test('should display column headers', async ({ page }) => {
      await expect(page.locator('text=To Do')).toBeVisible();
      await expect(page.locator('text=In Progress')).toBeVisible();
      await expect(page.locator('text=Done')).toBeVisible();
    });

    test('should show connection status', async ({ page }) => {
      await expect(page.locator('[data-testid="connection-status"]')).toBeVisible();
    });
  });

  test.describe('Task Creation', () => {
    test('should open task modal when Add Task button is clicked', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await expect(page.locator('[data-testid="task-modal"]')).toBeVisible();
      await expect(page.locator('text=Create New Task')).toBeVisible();
    });

    test('should create a new task successfully', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      
      // Fill in task details
      await page.fill('[data-testid="task-title-input"]', 'E2E Test Task');
      await page.fill('[data-testid="task-description-input"]', 'This is a test task created by Playwright');
      
      // Submit the form
      await page.click('[data-testid="submit-task-btn"]');
      
      // Modal should close
      await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible();
      
      // Task should appear on the board
      await expect(page.locator('text=E2E Test Task')).toBeVisible();
    });

    test('should show validation error when title is empty', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await page.click('[data-testid="submit-task-btn"]');
      
      await expect(page.locator('text=Title is required')).toBeVisible();
    });

    test('should close modal when cancel is clicked', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await expect(page.locator('[data-testid="task-modal"]')).toBeVisible();
      
      await page.click('[data-testid="cancel-btn"]');
      await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible();
    });

    test('should close modal when close button is clicked', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await expect(page.locator('[data-testid="task-modal"]')).toBeVisible();
      
      await page.click('[data-testid="close-modal-btn"]');
      await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible();
    });
  });

  test.describe('Task Editing', () => {
    test.beforeEach(async ({ page }) => {
      // Create a task first
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Task to Edit');
      await page.click('[data-testid="submit-task-btn"]');
      await expect(page.locator('text=Task to Edit')).toBeVisible();
    });

    test('should open edit modal when edit button is clicked', async ({ page }) => {
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Task to Edit' });
      const editButton = taskCard.locator('[data-testid^="edit-task-"]');
      
      await editButton.click();
      await expect(page.locator('[data-testid="task-modal"]')).toBeVisible();
      await expect(page.locator('text=Edit Task')).toBeVisible();
    });

    test('should update task successfully', async ({ page }) => {
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Task to Edit' });
      const editButton = taskCard.locator('[data-testid^="edit-task-"]');
      
      await editButton.click();
      
      // Update title
      await page.fill('[data-testid="task-title-input"]', 'Updated Task Title');
      await page.click('[data-testid="submit-task-btn"]');
      
      // Verify update
      await expect(page.locator('text=Updated Task Title')).toBeVisible();
      await expect(page.locator('text=Task to Edit')).not.toBeVisible();
    });
  });

  test.describe('Task Deletion', () => {
    test.beforeEach(async ({ page }) => {
      // Create a task first
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Task to Delete');
      await page.click('[data-testid="submit-task-btn"]');
      await expect(page.locator('text=Task to Delete')).toBeVisible();
    });

    test('should show delete confirmation when delete button is clicked', async ({ page }) => {
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Task to Delete' });
      const deleteButton = taskCard.locator('[data-testid^="delete-task-"]');
      
      await deleteButton.click();
      await expect(taskCard.locator('text=Delete')).toBeVisible();
      await expect(taskCard.locator('text=Cancel')).toBeVisible();
    });

    test('should cancel deletion when cancel is clicked', async ({ page }) => {
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Task to Delete' });
      const deleteButton = taskCard.locator('[data-testid^="delete-task-"]');
      
      await deleteButton.click();
      await taskCard.locator('text=Cancel').click();
      
      await expect(page.locator('text=Task to Delete')).toBeVisible();
    });

    test('should delete task when confirmed', async ({ page }) => {
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Task to Delete' });
      const deleteButton = taskCard.locator('[data-testid^="delete-task-"]');
      
      await deleteButton.click();
      await taskCard.locator('[data-testid^="confirm-delete-"]').click();
      
      await expect(page.locator('text=Task to Delete')).not.toBeVisible();
    });
  });
});
