import React from 'react';
import { render } from '@testing-library/react';
import { TaskProvider } from '../../context/TaskContext.jsx';
import { SocketProvider } from '../../context/SocketContext.jsx';

// Custom render function that includes providers
export function renderWithProviders(ui, options = {}) {
  function Wrapper({ children }) {
    return (
      <SocketProvider>
        <TaskProvider>
          {children}
        </TaskProvider>
      </SocketProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Mock task data
export const mockTasks = [
  {
    id: 'task-1',
    title: 'Test Task 1',
    description: 'Description for task 1',
    priority: 'high',
    category: 'bug',
    column: 'todo',
    attachments: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task-2',
    title: 'Test Task 2',
    description: 'Description for task 2',
    priority: 'medium',
    category: 'feature',
    column: 'inprogress',
    attachments: [],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'task-3',
    title: 'Test Task 3',
    description: 'Description for task 3',
    priority: 'low',
    category: 'enhancement',
    column: 'done',
    attachments: [
      {
        filename: 'test.pdf',
        originalName: 'test.pdf',
        url: 'http://localhost:3001/uploads/test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      },
    ],
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
];

// Mock socket instance
export const createMockSocket = () => ({
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connected: true,
});

// Wait for async operations
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

export * from '@testing-library/react';
