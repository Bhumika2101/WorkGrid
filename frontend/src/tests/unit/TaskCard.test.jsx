import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '../../../components/TaskCard.jsx';
import { TaskProvider } from '../../../context/TaskContext.jsx';
import { SocketProvider } from '../../../context/SocketContext.jsx';

// Mock the useTasks hook
vi.mock('../../../context/TaskContext.jsx', async () => {
  const actual = await vi.importActual('../../../context/TaskContext.jsx');
  return {
    ...actual,
    useTasks: () => ({
      deleteTask: vi.fn(),
    }),
  };
});

const mockTask = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test Description',
  priority: 'high',
  category: 'bug',
  column: 'todo',
  attachments: [],
};

const renderTaskCard = (task = mockTask, onEdit = vi.fn()) => {
  return render(
    <SocketProvider>
      <TaskProvider>
        <TaskCard task={task} onEdit={onEdit} isDragging={false} />
      </TaskProvider>
    </SocketProvider>
  );
};

describe('TaskCard Component', () => {
  describe('Rendering', () => {
    it('should render task title correctly', () => {
      renderTaskCard();
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('should render task description correctly', () => {
      renderTaskCard();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should render priority badge correctly', () => {
      renderTaskCard();
      expect(screen.getByText('high')).toBeInTheDocument();
    });

    it('should render category badge correctly', () => {
      renderTaskCard();
      expect(screen.getByText('bug')).toBeInTheDocument();
    });

    it('should render edit button', () => {
      renderTaskCard();
      const editButton = screen.getByTestId('edit-task-task-1');
      expect(editButton).toBeInTheDocument();
    });

    it('should render delete button', () => {
      renderTaskCard();
      const deleteButton = screen.getByTestId('delete-task-task-1');
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('Priority Colors', () => {
    it('should show high priority with correct styling', () => {
      renderTaskCard({ ...mockTask, priority: 'high' });
      const priorityBadge = screen.getByTestId('task-priority-task-1');
      expect(priorityBadge).toHaveTextContent('high');
    });

    it('should show medium priority with correct styling', () => {
      renderTaskCard({ ...mockTask, priority: 'medium' });
      const priorityBadge = screen.getByTestId('task-priority-task-1');
      expect(priorityBadge).toHaveTextContent('medium');
    });

    it('should show low priority with correct styling', () => {
      renderTaskCard({ ...mockTask, priority: 'low' });
      const priorityBadge = screen.getByTestId('task-priority-task-1');
      expect(priorityBadge).toHaveTextContent('low');
    });
  });

  describe('Category Colors', () => {
    it('should show bug category correctly', () => {
      renderTaskCard({ ...mockTask, category: 'bug' });
      const categoryBadge = screen.getByTestId('task-category-task-1');
      expect(categoryBadge).toHaveTextContent('bug');
    });

    it('should show feature category correctly', () => {
      renderTaskCard({ ...mockTask, category: 'feature' });
      const categoryBadge = screen.getByTestId('task-category-task-1');
      expect(categoryBadge).toHaveTextContent('feature');
    });

    it('should show enhancement category correctly', () => {
      renderTaskCard({ ...mockTask, category: 'enhancement' });
      const categoryBadge = screen.getByTestId('task-category-task-1');
      expect(categoryBadge).toHaveTextContent('enhancement');
    });
  });

  describe('Attachments', () => {
    it('should not show attachments indicator when no attachments', () => {
      renderTaskCard();
      expect(screen.queryByText(/attachment/i)).not.toBeInTheDocument();
    });

    it('should show attachments indicator when has attachments', () => {
      const taskWithAttachments = {
        ...mockTask,
        attachments: [
          { filename: 'test.pdf', originalName: 'test.pdf', url: 'test', mimetype: 'application/pdf', size: 1024 },
        ],
      };
      renderTaskCard(taskWithAttachments);
      expect(screen.getByText('1 attachment(s)')).toBeInTheDocument();
    });

    it('should show correct count for multiple attachments', () => {
      const taskWithAttachments = {
        ...mockTask,
        attachments: [
          { filename: 'test1.pdf', originalName: 'test1.pdf', url: 'test1', mimetype: 'application/pdf', size: 1024 },
          { filename: 'test2.pdf', originalName: 'test2.pdf', url: 'test2', mimetype: 'application/pdf', size: 1024 },
        ],
      };
      renderTaskCard(taskWithAttachments);
      expect(screen.getByText('2 attachment(s)')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onEdit when edit button is clicked', () => {
      const onEdit = vi.fn();
      renderTaskCard(mockTask, onEdit);
      
      const editButton = screen.getByTestId('edit-task-task-1');
      fireEvent.click(editButton);
      
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('should show delete confirmation when delete button is clicked', () => {
      renderTaskCard();
      
      const deleteButton = screen.getByTestId('delete-task-task-1');
      fireEvent.click(deleteButton);
      
      expect(screen.getByTestId('confirm-delete-task-1')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should hide confirmation when cancel is clicked', () => {
      renderTaskCard();
      
      // Click delete
      const deleteButton = screen.getByTestId('delete-task-task-1');
      fireEvent.click(deleteButton);
      
      // Click cancel
      fireEvent.click(screen.getByText('Cancel'));
      
      // Confirmation should be hidden
      expect(screen.queryByTestId('confirm-delete-task-1')).not.toBeInTheDocument();
    });
  });

  describe('Dragging State', () => {
    it('should apply dragging styles when isDragging is true', () => {
      render(
        <SocketProvider>
          <TaskProvider>
            <TaskCard task={mockTask} onEdit={vi.fn()} isDragging={true} />
          </TaskProvider>
        </SocketProvider>
      );
      
      const card = screen.getByTestId('task-card-task-1');
      expect(card).toHaveClass('ring-2', 'ring-blue-500');
    });
  });
});
