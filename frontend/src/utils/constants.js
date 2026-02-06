export const COLUMNS = {
  TODO: 'todo',
  IN_PROGRESS: 'inprogress',
  DONE: 'done',
};

export const COLUMN_CONFIG = [
  { id: COLUMNS.TODO, title: 'To Do', color: 'bg-gray-500' },
  { id: COLUMNS.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-500' },
  { id: COLUMNS.DONE, title: 'Done', color: 'bg-green-500' },
];

export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const PRIORITY_OPTIONS = [
  { value: PRIORITIES.LOW, label: 'Low', color: '#22c55e' },
  { value: PRIORITIES.MEDIUM, label: 'Medium', color: '#f59e0b' },
  { value: PRIORITIES.HIGH, label: 'High', color: '#ef4444' },
];

export const CATEGORIES = {
  BUG: 'bug',
  FEATURE: 'feature',
  ENHANCEMENT: 'enhancement',
};

export const CATEGORY_OPTIONS = [
  { value: CATEGORIES.BUG, label: 'Bug', color: '#ef4444' },
  { value: CATEGORIES.FEATURE, label: 'Feature', color: '#3b82f6' },
  { value: CATEGORIES.ENHANCEMENT, label: 'Enhancement', color: '#8b5cf6' },
];

export const SOCKET_EVENTS = {
  // Client to Server
  TASK_CREATE: 'task:create',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_MOVE: 'task:move',
  
  // Server to Client
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_MOVED: 'task:moved',
  SYNC_TASKS: 'sync:tasks',
  ERROR: 'error',
};

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
