import { test, expect } from '@playwright/test';

test.describe('Real-time Sync E2E Tests', () => {
  test.describe('Multi-Client Sync', () => {
    test('should sync task creation across multiple clients', async ({ browser }) => {
      // Open two browser contexts to simulate two clients
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      // Navigate both pages to the app
      await page1.goto('/');
      await page2.goto('/');
      
      // Wait for both to connect
      await expect(page1.locator('text=Connected')).toBeVisible({ timeout: 10000 });
      await expect(page2.locator('text=Connected')).toBeVisible({ timeout: 10000 });
      
      // Create a task in page1
      await page1.click('[data-testid="add-task-btn"]');
      await page1.fill('[data-testid="task-title-input"]', 'Synced Task');
      await page1.click('[data-testid="submit-task-btn"]');
      
      // Task should appear in page1
      await expect(page1.locator('text=Synced Task')).toBeVisible();
      
      // Task should also appear in page2 (real-time sync)
      await expect(page2.locator('text=Synced Task')).toBeVisible({ timeout: 5000 });
      
      // Cleanup
      await context1.close();
      await context2.close();
    });

    test('should sync task deletion across multiple clients', async ({ browser }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      await page1.goto('/');
      await page2.goto('/');
      
      await expect(page1.locator('text=Connected')).toBeVisible({ timeout: 10000 });
      await expect(page2.locator('text=Connected')).toBeVisible({ timeout: 10000 });
      
      // Create a task in page1
      await page1.click('[data-testid="add-task-btn"]');
      await page1.fill('[data-testid="task-title-input"]', 'Task to Delete Sync');
      await page1.click('[data-testid="submit-task-btn"]');
      
      // Wait for sync
      await expect(page2.locator('text=Task to Delete Sync')).toBeVisible({ timeout: 5000 });
      
      // Delete task in page1
      const taskCard = page1.locator('[data-testid^="task-card-"]').filter({ hasText: 'Task to Delete Sync' });
      await taskCard.locator('[data-testid^="delete-task-"]').click();
      await taskCard.locator('[data-testid^="confirm-delete-"]').click();
      
      // Task should be removed from both pages
      await expect(page1.locator('text=Task to Delete Sync')).not.toBeVisible();
      await expect(page2.locator('text=Task to Delete Sync')).not.toBeVisible({ timeout: 5000 });
      
      await context1.close();
      await context2.close();
    });

    test('should sync task move across multiple clients', async ({ browser }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      await page1.goto('/');
      await page2.goto('/');
      
      await expect(page1.locator('text=Connected')).toBeVisible({ timeout: 10000 });
      await expect(page2.locator('text=Connected')).toBeVisible({ timeout: 10000 });
      
      // Create a task in page1
      await page1.click('[data-testid="add-task-btn"]');
      await page1.fill('[data-testid="task-title-input"]', 'Task to Move Sync');
      await page1.click('[data-testid="submit-task-btn"]');
      
      // Wait for sync
      await expect(page2.locator('text=Task to Move Sync')).toBeVisible({ timeout: 5000 });
      
      // Move task in page1
      const taskCard = page1.locator('[data-testid^="task-card-"]').filter({ hasText: 'Task to Move Sync' });
      const doneColumn = page1.locator('[data-testid="droppable-done"]');
      
      await taskCard.dragTo(doneColumn);
      
      // Task should be in Done column in page1
      await expect(page1.locator('[data-testid="droppable-done"]').locator('text=Task to Move Sync')).toBeVisible();
      
      // Task should also be in Done column in page2
      await expect(page2.locator('[data-testid="droppable-done"]').locator('text=Task to Move Sync')).toBeVisible({ timeout: 5000 });
      
      await context1.close();
      await context2.close();
    });
  });

  test.describe('Connection Status', () => {
    test('should show connected status when WebSocket connects', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('[data-testid="connection-status"]')).toBeVisible();
      await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });
    });

    test('should recover from temporary disconnection', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });
      
      // Create a task while connected
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Persistent Task');
      await page.click('[data-testid="submit-task-btn"]');
      
      await expect(page.locator('text=Persistent Task')).toBeVisible();
      
      // Task should still be visible (persistent)
      await expect(page.locator('text=Persistent Task')).toBeVisible();
    });
  });
});
