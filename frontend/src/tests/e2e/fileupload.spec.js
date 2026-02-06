import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('File Upload E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="connection-status"]');
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });
  });

  test.describe('Valid File Uploads', () => {
    test('should upload an image file successfully', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Task with Image');
      
      // Create a mock image file
      const fileInput = page.locator('[data-testid="file-upload-input"]');
      
      // Set up file chooser before clicking
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        fileInput.click(),
      ]);
      
      // Use a simple test image (1x1 pixel PNG)
      const testImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      await fileChooser.setFiles({
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: testImageBuffer,
      });
      
      // Wait for upload to complete
      await expect(page.locator('[data-testid="attachment-0"]')).toBeVisible({ timeout: 10000 });
      
      // Verify file is shown in attachments list
      await expect(page.locator('text=test-image.png')).toBeVisible();
    });

    test('should upload a PDF file successfully', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Task with PDF');
      
      const fileInput = page.locator('[data-testid="file-upload-input"]');
      
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        fileInput.click(),
      ]);
      
      // Create a minimal PDF file
      const testPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>', 'utf-8');
      
      await fileChooser.setFiles({
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: testPdfBuffer,
      });
      
      await expect(page.locator('[data-testid="attachment-0"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=test-document.pdf')).toBeVisible();
    });

    test('should remove uploaded attachment', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Task with Attachment to Remove');
      
      const fileInput = page.locator('[data-testid="file-upload-input"]');
      
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        fileInput.click(),
      ]);
      
      const testImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      await fileChooser.setFiles({
        name: 'to-remove.png',
        mimeType: 'image/png',
        buffer: testImageBuffer,
      });
      
      await expect(page.locator('[data-testid="attachment-0"]')).toBeVisible({ timeout: 10000 });
      
      // Remove the attachment
      await page.click('[data-testid="remove-attachment-0"]');
      
      await expect(page.locator('[data-testid="attachment-0"]')).not.toBeVisible();
      await expect(page.locator('text=to-remove.png')).not.toBeVisible();
    });

    test('should upload multiple files', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Task with Multiple Files');
      
      const fileInput = page.locator('[data-testid="file-upload-input"]');
      
      // Upload first file
      let [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        fileInput.click(),
      ]);
      
      const testImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      await fileChooser.setFiles({
        name: 'file1.png',
        mimeType: 'image/png',
        buffer: testImageBuffer,
      });
      
      await expect(page.locator('[data-testid="attachment-0"]')).toBeVisible({ timeout: 10000 });
      
      // Upload second file
      [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        fileInput.click(),
      ]);
      
      await fileChooser.setFiles({
        name: 'file2.png',
        mimeType: 'image/png',
        buffer: testImageBuffer,
      });
      
      await expect(page.locator('[data-testid="attachment-1"]')).toBeVisible({ timeout: 10000 });
      
      // Both files should be visible
      await expect(page.locator('text=file1.png')).toBeVisible();
      await expect(page.locator('text=file2.png')).toBeVisible();
    });
  });

  test.describe('Invalid File Uploads', () => {
    test('should show error for unsupported file type', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Task with Invalid File');
      
      const fileInput = page.locator('[data-testid="file-upload-input"]');
      
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        fileInput.click(),
      ]);
      
      // Try to upload an executable file
      await fileChooser.setFiles({
        name: 'malicious.exe',
        mimeType: 'application/x-msdownload',
        buffer: Buffer.from('fake exe content'),
      });
      
      // Should show error message
      await expect(page.locator('[data-testid="upload-error"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Invalid file type')).toBeVisible();
      
      // No attachment should be added
      await expect(page.locator('[data-testid="attachment-0"]')).not.toBeVisible();
    });
  });

  test.describe('Attachment in Saved Tasks', () => {
    test('should show attachment indicator on task card', async ({ page }) => {
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', 'Task with Saved Attachment');
      
      const fileInput = page.locator('[data-testid="file-upload-input"]');
      
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        fileInput.click(),
      ]);
      
      const testImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      await fileChooser.setFiles({
        name: 'attachment.png',
        mimeType: 'image/png',
        buffer: testImageBuffer,
      });
      
      await expect(page.locator('[data-testid="attachment-0"]')).toBeVisible({ timeout: 10000 });
      
      // Submit the task
      await page.click('[data-testid="submit-task-btn"]');
      
      // Task card should show attachment indicator
      const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Task with Saved Attachment' });
      await expect(taskCard.locator('text=1 attachment')).toBeVisible();
    });
  });
});
