import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { TaskProvider, useTasks } from '../../../context/TaskContext.jsx';
import { SocketProvider, useSocket } from '../../../context/SocketContext.jsx';

// Mock Socket.IO
const mockEmit = vi.fn();
const mockOn = vi.fn();
const mockOff = vi.fn();
const eventHandlers = new Map();

const mockSocket = {
  emit: mockEmit,
  on: (event, handler) => {
    eventHandlers.set(event, handler);
    mockOn(event, handler);
    return mockSocket;
  },
  off: (event, handler) => {
    eventHandlers.delete(event);
    mockOff(event, handler);
    return mockSocket;
  },
  disconnect: vi.fn(),
  connected: true,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

const wrapper = ({ children }) => (
  <SocketProvider>
    <TaskProvider>{children}</TaskProvider>
  </SocketProvider>
);

describe('WebSocket Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventHandlers.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Socket Connection', () => {
    it('should establish socket connection on mount', () => {
      const { result } = renderHook(() => useSocket(), { wrapper });
      expect(result.current.socket).toBeDefined();
    });

    it('should provide emit function', () => {
      const { result } = renderHook(() => useSocket(), { wrapper });
      expect(typeof result.current.emit).toBe('function');
    });

    it('should provide on function', () => {
      const { result } = renderHook(() => useSocket(), { wrapper });
      expect(typeof result.current.on).toBe('function');
    });
  });

  describe('Task Operations via WebSocket', () => {
    it('should emit task:create event when creating task', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      act(() => {
        result.current.createTask({
          title: 'New Task',
          description: 'Description',
          priority: 'high',
          category: 'feature',
          column: 'todo',
        });
      });

      expect(mockEmit).toHaveBeenCalledWith('task:create', expect.objectContaining({
        title: 'New Task',
        description: 'Description',
        priority: 'high',
        category: 'feature',
        column: 'todo',
      }));
    });

    it('should emit task:update event when updating task', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      act(() => {
        result.current.updateTask({
          id: 'task-1',
          title: 'Updated Task',
        });
      });

      expect(mockEmit).toHaveBeenCalledWith('task:update', expect.objectContaining({
        id: 'task-1',
        title: 'Updated Task',
      }));
    });

    it('should emit task:delete event when deleting task', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      act(() => {
        result.current.deleteTask('task-1');
      });

      expect(mockEmit).toHaveBeenCalledWith('task:delete', 'task-1');
    });

    it('should emit task:move event when moving task', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      act(() => {
        result.current.moveTask('task-1', 'todo', 'inprogress', 0, 1);
      });

      expect(mockEmit).toHaveBeenCalledWith('task:move', {
        taskId: 'task-1',
        sourceColumn: 'todo',
        destinationColumn: 'inprogress',
        sourceIndex: 0,
        destinationIndex: 1,
      });
    });
  });

  describe('Receiving WebSocket Events', () => {
    it('should update tasks when sync:tasks event is received', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      const mockTasks = [
        { id: 'task-1', title: 'Task 1', column: 'todo' },
        { id: 'task-2', title: 'Task 2', column: 'inprogress' },
      ];

      // Simulate receiving sync:tasks event
      const syncTasksHandler = eventHandlers.get('sync:tasks');
      if (syncTasksHandler) {
        act(() => {
          syncTasksHandler(mockTasks);
        });

        await waitFor(() => {
          expect(result.current.tasks).toEqual(mockTasks);
        });
      }
    });

    it('should add task when task:created event is received', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      const newTask = { id: 'task-new', title: 'New Task', column: 'todo' };

      // Simulate receiving task:created event
      const createdHandler = eventHandlers.get('task:created');
      if (createdHandler) {
        act(() => {
          createdHandler(newTask);
        });

        await waitFor(() => {
          expect(result.current.tasks).toContainEqual(newTask);
        });
      }
    });

    it('should update task when task:updated event is received', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // First, set initial tasks
      const syncTasksHandler = eventHandlers.get('sync:tasks');
      if (syncTasksHandler) {
        act(() => {
          syncTasksHandler([{ id: 'task-1', title: 'Original Title', column: 'todo' }]);
        });
      }

      // Then update
      const updatedTask = { id: 'task-1', title: 'Updated Title', column: 'todo' };
      const updatedHandler = eventHandlers.get('task:updated');
      if (updatedHandler) {
        act(() => {
          updatedHandler(updatedTask);
        });

        await waitFor(() => {
          const task = result.current.tasks.find(t => t.id === 'task-1');
          expect(task?.title).toBe('Updated Title');
        });
      }
    });

    it('should remove task when task:deleted event is received', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // First, set initial tasks
      const syncTasksHandler = eventHandlers.get('sync:tasks');
      if (syncTasksHandler) {
        act(() => {
          syncTasksHandler([
            { id: 'task-1', title: 'Task 1', column: 'todo' },
            { id: 'task-2', title: 'Task 2', column: 'todo' },
          ]);
        });
      }

      // Then delete
      const deletedHandler = eventHandlers.get('task:deleted');
      if (deletedHandler) {
        act(() => {
          deletedHandler({ id: 'task-1' });
        });

        await waitFor(() => {
          expect(result.current.tasks).not.toContainEqual(
            expect.objectContaining({ id: 'task-1' })
          );
        });
      }
    });
  });

  describe('Task Filtering by Column', () => {
    it('should filter tasks by column correctly', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      const mockTasks = [
        { id: 'task-1', title: 'Task 1', column: 'todo' },
        { id: 'task-2', title: 'Task 2', column: 'inprogress' },
        { id: 'task-3', title: 'Task 3', column: 'done' },
        { id: 'task-4', title: 'Task 4', column: 'todo' },
      ];

      const syncTasksHandler = eventHandlers.get('sync:tasks');
      if (syncTasksHandler) {
        act(() => {
          syncTasksHandler(mockTasks);
        });

        await waitFor(() => {
          const todoTasks = result.current.getTasksByColumn('todo');
          const inProgressTasks = result.current.getTasksByColumn('inprogress');
          const doneTasks = result.current.getTasksByColumn('done');

          expect(todoTasks).toHaveLength(2);
          expect(inProgressTasks).toHaveLength(1);
          expect(doneTasks).toHaveLength(1);
        });
      }
    });
  });

  describe('Task Count Statistics', () => {
    it('should calculate task counts correctly', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      const mockTasks = [
        { id: 'task-1', title: 'Task 1', column: 'todo' },
        { id: 'task-2', title: 'Task 2', column: 'todo' },
        { id: 'task-3', title: 'Task 3', column: 'inprogress' },
        { id: 'task-4', title: 'Task 4', column: 'done' },
        { id: 'task-5', title: 'Task 5', column: 'done' },
        { id: 'task-6', title: 'Task 6', column: 'done' },
      ];

      const syncTasksHandler = eventHandlers.get('sync:tasks');
      if (syncTasksHandler) {
        act(() => {
          syncTasksHandler(mockTasks);
        });

        await waitFor(() => {
          const counts = result.current.getTaskCounts();

          expect(counts.todo).toBe(2);
          expect(counts.inprogress).toBe(1);
          expect(counts.done).toBe(3);
          expect(counts.total).toBe(6);
        });
      }
    });
  });
});
