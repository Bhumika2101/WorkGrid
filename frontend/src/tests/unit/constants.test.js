import { describe, it, expect, vi } from 'vitest';
import {
  COLUMNS,
  COLUMN_CONFIG,
  PRIORITIES,
  PRIORITY_OPTIONS,
  CATEGORIES,
  CATEGORY_OPTIONS,
  SOCKET_EVENTS,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from '../../../utils/constants';

describe('Constants', () => {
  describe('COLUMNS', () => {
    it('should have correct column IDs', () => {
      expect(COLUMNS.TODO).toBe('todo');
      expect(COLUMNS.IN_PROGRESS).toBe('inprogress');
      expect(COLUMNS.DONE).toBe('done');
    });
  });

  describe('COLUMN_CONFIG', () => {
    it('should have three columns', () => {
      expect(COLUMN_CONFIG).toHaveLength(3);
    });

    it('should have correct structure for each column', () => {
      COLUMN_CONFIG.forEach((column) => {
        expect(column).toHaveProperty('id');
        expect(column).toHaveProperty('title');
        expect(column).toHaveProperty('color');
      });
    });
  });

  describe('PRIORITIES', () => {
    it('should have correct priority values', () => {
      expect(PRIORITIES.LOW).toBe('low');
      expect(PRIORITIES.MEDIUM).toBe('medium');
      expect(PRIORITIES.HIGH).toBe('high');
    });
  });

  describe('PRIORITY_OPTIONS', () => {
    it('should have three priority options', () => {
      expect(PRIORITY_OPTIONS).toHaveLength(3);
    });

    it('should have correct structure for each priority', () => {
      PRIORITY_OPTIONS.forEach((priority) => {
        expect(priority).toHaveProperty('value');
        expect(priority).toHaveProperty('label');
        expect(priority).toHaveProperty('color');
      });
    });
  });

  describe('CATEGORIES', () => {
    it('should have correct category values', () => {
      expect(CATEGORIES.BUG).toBe('bug');
      expect(CATEGORIES.FEATURE).toBe('feature');
      expect(CATEGORIES.ENHANCEMENT).toBe('enhancement');
    });
  });

  describe('CATEGORY_OPTIONS', () => {
    it('should have three category options', () => {
      expect(CATEGORY_OPTIONS).toHaveLength(3);
    });

    it('should have correct structure for each category', () => {
      CATEGORY_OPTIONS.forEach((category) => {
        expect(category).toHaveProperty('value');
        expect(category).toHaveProperty('label');
        expect(category).toHaveProperty('color');
      });
    });
  });

  describe('SOCKET_EVENTS', () => {
    it('should have client-to-server events', () => {
      expect(SOCKET_EVENTS.TASK_CREATE).toBe('task:create');
      expect(SOCKET_EVENTS.TASK_UPDATE).toBe('task:update');
      expect(SOCKET_EVENTS.TASK_DELETE).toBe('task:delete');
      expect(SOCKET_EVENTS.TASK_MOVE).toBe('task:move');
    });

    it('should have server-to-client events', () => {
      expect(SOCKET_EVENTS.TASK_CREATED).toBe('task:created');
      expect(SOCKET_EVENTS.TASK_UPDATED).toBe('task:updated');
      expect(SOCKET_EVENTS.TASK_DELETED).toBe('task:deleted');
      expect(SOCKET_EVENTS.TASK_MOVED).toBe('task:moved');
      expect(SOCKET_EVENTS.SYNC_TASKS).toBe('sync:tasks');
      expect(SOCKET_EVENTS.ERROR).toBe('error');
    });
  });

  describe('ALLOWED_FILE_TYPES', () => {
    it('should include image types', () => {
      expect(ALLOWED_FILE_TYPES).toContain('image/jpeg');
      expect(ALLOWED_FILE_TYPES).toContain('image/png');
      expect(ALLOWED_FILE_TYPES).toContain('image/gif');
      expect(ALLOWED_FILE_TYPES).toContain('image/webp');
    });

    it('should include document types', () => {
      expect(ALLOWED_FILE_TYPES).toContain('application/pdf');
      expect(ALLOWED_FILE_TYPES).toContain('application/msword');
      expect(ALLOWED_FILE_TYPES).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(ALLOWED_FILE_TYPES).toContain('text/plain');
    });

    it('should not include executable types', () => {
      expect(ALLOWED_FILE_TYPES).not.toContain('application/x-msdownload');
      expect(ALLOWED_FILE_TYPES).not.toContain('application/x-executable');
    });
  });

  describe('MAX_FILE_SIZE', () => {
    it('should be 5MB', () => {
      expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
    });
  });
});
