import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import KanbanBoard from '../../../components/KanbanBoard.jsx';
import { TaskProvider } from '../../../context/TaskContext.jsx';
import { SocketProvider } from '../../../context/SocketContext.jsx';

// Mock Socket.IO
const mockEmit = vi.fn();
const eventHandlers = new Map();

const mockSocket = {
  emit: mockEmit,
  on: (event, handler) => {
    eventHandlers.set(event, handler);
    return mockSocket;
  },
  off: (event, handler) => {
    eventHandlers.delete(event);
    return mockSocket;
  },
  disconnect: vi.fn(),
  connected: true,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

// Mock @hello-pangea/dnd
let onDragEndCallback = null;

vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children, onDragEnd }) => {
    onDragEndCallback = onDragEnd;
    return <div data-testid="drag-context">{children}</div>;
  },
  Droppable: ({ children, droppableId }) =>
    children(
      {
        innerRef: vi.fn(),
        droppableProps: { 'data-droppable-id': droppableId },
        placeholder: null,
      },
      { isDraggingOver: false }
    ),
  Draggable: ({ children, draggableId }) =>
    children(
      {
        innerRef: vi.fn(),
        draggableProps: { 'data-draggable-id': draggableId },
        dragHandleProps: {},
      },
      { isDragging: false }
    ),
}));

const mockTasks = [
  { id: 'task-1', title: 'Task 1', description: 'Desc 1', priority: 'high', category: 'bug', column: 'todo', attachments: [] },
  { id: 'task-2', title: 'Task 2', description: 'Desc 2', priority: 'medium', category: 'feature', column: 'inprogress', attachments: [] },
  { id: 'task-3', title: 'Task 3', description: 'Desc 3', priority: 'low', category: 'enhancement', column: 'done', attachments: [] },
];

const renderKanbanBoard = (onEditTask = vi.fn()) => {
  return render(
    <SocketProvider>
      <TaskProvider>
        <KanbanBoard onEditTask={onEditTask} />
      </TaskProvider>
    </SocketProvider>
  );
};

describe('KanbanBoard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventHandlers.clear();
    onDragEndCallback = null;
  });

  describe('Board Rendering', () => {
    it('should render all three columns', () => {
      renderKanbanBoard();
      
      expect(screen.getByTestId('column-todo')).toBeInTheDocument();
      expect(screen.getByTestId('column-inprogress')).toBeInTheDocument();
      expect(screen.getByTestId('column-done')).toBeInTheDocument();
    });

    it('should render column headers with correct titles', () => {
      renderKanbanBoard();
      
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('should render quick add buttons for each column', () => {
      renderKanbanBoard();
      
      expect(screen.getByTestId('quick-add-todo')).toBeInTheDocument();
      expect(screen.getByTestId('quick-add-inprogress')).toBeInTheDocument();
      expect(screen.getByTestId('quick-add-done')).toBeInTheDocument();
    });
  });

  describe('Task Display', () => {
    it('should render tasks when sync:tasks event is received', async () => {
      renderKanbanBoard();
      
      // Simulate receiving tasks
      const syncHandler = eventHandlers.get('sync:tasks');
      if (syncHandler) {
        syncHandler(mockTasks);
      }

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getByText('Task 3')).toBeInTheDocument();
      });
    });

    it('should show task count in column headers', async () => {
      renderKanbanBoard();
      
      const syncHandler = eventHandlers.get('sync:tasks');
      if (syncHandler) {
        syncHandler(mockTasks);
      }

      await waitFor(() => {
        // Each column should show count of 1
        const countBadges = screen.getAllByText('1');
        expect(countBadges.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should show empty state when column has no tasks', () => {
      renderKanbanBoard();
      
      expect(screen.getAllByText('No tasks yet').length).toBe(3);
    });
  });

  describe('Drag and Drop', () => {
    it('should call moveTask when task is dragged to another column', async () => {
      renderKanbanBoard();
      
      const syncHandler = eventHandlers.get('sync:tasks');
      if (syncHandler) {
        syncHandler(mockTasks);
      }

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Simulate drag end
      if (onDragEndCallback) {
        onDragEndCallback({
          draggableId: 'task-1',
          source: { droppableId: 'todo', index: 0 },
          destination: { droppableId: 'inprogress', index: 0 },
        });
      }

      expect(mockEmit).toHaveBeenCalledWith('task:move', {
        taskId: 'task-1',
        sourceColumn: 'todo',
        destinationColumn: 'inprogress',
        sourceIndex: 0,
        destinationIndex: 0,
      });
    });

    it('should not call moveTask when dropped in same position', async () => {
      renderKanbanBoard();
      mockEmit.mockClear();

      const syncHandler = eventHandlers.get('sync:tasks');
      if (syncHandler) {
        syncHandler(mockTasks);
      }

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Simulate drag end to same position
      if (onDragEndCallback) {
        onDragEndCallback({
          draggableId: 'task-1',
          source: { droppableId: 'todo', index: 0 },
          destination: { droppableId: 'todo', index: 0 },
        });
      }

      expect(mockEmit).not.toHaveBeenCalledWith('task:move', expect.anything());
    });

    it('should not call moveTask when dropped outside droppable area', async () => {
      renderKanbanBoard();
      mockEmit.mockClear();

      const syncHandler = eventHandlers.get('sync:tasks');
      if (syncHandler) {
        syncHandler(mockTasks);
      }

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Simulate drag end with no destination
      if (onDragEndCallback) {
        onDragEndCallback({
          draggableId: 'task-1',
          source: { droppableId: 'todo', index: 0 },
          destination: null,
        });
      }

      expect(mockEmit).not.toHaveBeenCalledWith('task:move', expect.anything());
    });
  });

  describe('Task Editing', () => {
    it('should call onEditTask when edit button is clicked', async () => {
      const onEditTask = vi.fn();
      renderKanbanBoard(onEditTask);
      
      const syncHandler = eventHandlers.get('sync:tasks');
      if (syncHandler) {
        syncHandler(mockTasks);
      }

      await waitFor(() => {
        expect(screen.getByTestId('edit-task-task-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('edit-task-task-1'));

      expect(onEditTask).toHaveBeenCalledWith(mockTasks[0]);
    });
  });

  describe('Task Deletion', () => {
    it('should emit delete event when task is deleted', async () => {
      renderKanbanBoard();
      
      const syncHandler = eventHandlers.get('sync:tasks');
      if (syncHandler) {
        syncHandler(mockTasks);
      }

      await waitFor(() => {
        expect(screen.getByTestId('delete-task-task-1')).toBeInTheDocument();
      });

      // Click delete button
      fireEvent.click(screen.getByTestId('delete-task-task-1'));

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByTestId('confirm-delete-task-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('confirm-delete-task-1'));

      expect(mockEmit).toHaveBeenCalledWith('task:delete', 'task-1');
    });
  });

  describe('Quick Add Task', () => {
    it('should emit create event when quick adding task', async () => {
      // Mock window.prompt
      const originalPrompt = window.prompt;
      window.prompt = vi.fn().mockReturnValue('Quick Task');
      
      renderKanbanBoard();

      fireEvent.click(screen.getByTestId('quick-add-todo'));

      expect(mockEmit).toHaveBeenCalledWith('task:create', expect.objectContaining({
        title: 'Quick Task',
        column: 'todo',
      }));

      // Restore
      window.prompt = originalPrompt;
    });

    it('should not emit when quick add is cancelled', async () => {
      // Mock window.prompt to return null (cancelled)
      const originalPrompt = window.prompt;
      window.prompt = vi.fn().mockReturnValue(null);
      
      renderKanbanBoard();
      mockEmit.mockClear();

      fireEvent.click(screen.getByTestId('quick-add-todo'));

      expect(mockEmit).not.toHaveBeenCalledWith('task:create', expect.anything());

      // Restore
      window.prompt = originalPrompt;
    });
  });
});
