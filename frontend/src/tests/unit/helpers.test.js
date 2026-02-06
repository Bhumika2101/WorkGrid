import { describe, it, expect, vi } from 'vitest';
import {
  formatFileSize,
  isImageFile,
  generateId,
  formatRelativeTime,
  debounce,
  cn,
  validateTask,
} from '../../../utils/helpers';

describe('Helper Functions', () => {
  describe('formatFileSize', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });
  });

  describe('isImageFile', () => {
    it('should return true for image mime types', () => {
      expect(isImageFile('image/jpeg')).toBe(true);
      expect(isImageFile('image/png')).toBe(true);
      expect(isImageFile('image/gif')).toBe(true);
      expect(isImageFile('image/webp')).toBe(true);
    });

    it('should return false for non-image mime types', () => {
      expect(isImageFile('application/pdf')).toBe(false);
      expect(isImageFile('text/plain')).toBe(false);
      expect(isImageFile('video/mp4')).toBe(false);
    });

    it('should handle undefined/null', () => {
      expect(isImageFile(undefined)).toBe(false);
      expect(isImageFile(null)).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should generate a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('formatRelativeTime', () => {
    it('should format just now correctly', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('Just now');
    });

    it('should format minutes ago correctly', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('5 minutes ago');
    });

    it('should format 1 minute ago correctly', () => {
      const date = new Date(Date.now() - 1 * 60 * 1000 - 1000);
      expect(formatRelativeTime(date)).toBe('1 minute ago');
    });

    it('should format hours ago correctly', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('3 hours ago');
    });

    it('should format 1 hour ago correctly', () => {
      const date = new Date(Date.now() - 1 * 60 * 60 * 1000 - 1000);
      expect(formatRelativeTime(date)).toBe('1 hour ago');
    });

    it('should format days ago correctly', () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('2 days ago');
    });

    it('should format 1 day ago correctly', () => {
      const date = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 1000);
      expect(formatRelativeTime(date)).toBe('1 day ago');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce function calls', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('arg1', 'arg2');

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('cn', () => {
    it('should join class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should filter out falsy values', () => {
      expect(cn('class1', false, 'class2', null, undefined, 'class3')).toBe('class1 class2 class3');
    });

    it('should return empty string for no classes', () => {
      expect(cn()).toBe('');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
    });
  });

  describe('validateTask', () => {
    it('should return valid for valid task', () => {
      const task = { title: 'Valid Task', description: 'Description' };
      const result = validateTask(task);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return error for empty title', () => {
      const task = { title: '', description: 'Description' };
      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Title is required');
    });

    it('should return error for whitespace-only title', () => {
      const task = { title: '   ', description: 'Description' };
      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Title is required');
    });

    it('should return error for title too long', () => {
      const task = { title: 'a'.repeat(101), description: 'Description' };
      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Title must be less than 100 characters');
    });

    it('should return error for description too long', () => {
      const task = { title: 'Valid', description: 'a'.repeat(501) };
      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBe('Description must be less than 500 characters');
    });
  });
});
