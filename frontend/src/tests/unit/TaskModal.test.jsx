import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskModal from '../../../components/TaskModal.jsx';
import { TaskProvider } from '../../../context/TaskContext.jsx';
import { SocketProvider } from '../../../context/SocketContext.jsx';

// Mock fetch for file uploads
global.fetch = vi.fn();

// Mock the useTasks hook
const mockCreateTask = vi.fn();
const mockUpdateTask = vi.fn();

vi.mock('../../../context/TaskContext.jsx', async () => {
  const actual = await vi.importActual('../../../context/TaskContext.jsx');
  return {
    ...actual,
    useTasks: () => ({
      createTask: mockCreateTask,
      updateTask: mockUpdateTask,
    }),
  };
});

const renderTaskModal = (task = null, onClose = vi.fn()) => {
  return render(
    <SocketProvider>
      <TaskProvider>
        <TaskModal task={task} onClose={onClose} />
      </TaskProvider>
    </SocketProvider>
  );
};

describe('TaskModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockReset();
  });

  describe('Create Mode', () => {
    it('should render create task modal', () => {
      renderTaskModal();
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });

    it('should render empty form fields', () => {
      renderTaskModal();
      expect(screen.getByTestId('task-title-input')).toHaveValue('');
      expect(screen.getByTestId('task-description-input')).toHaveValue('');
    });

    it('should render submit button with "Create Task" text', () => {
      renderTaskModal();
      expect(screen.getByTestId('submit-task-btn')).toHaveTextContent('Create Task');
    });
  });

  describe('Edit Mode', () => {
    const existingTask = {
      id: 'task-1',
      title: 'Existing Task',
      description: 'Existing Description',
      priority: 'high',
      category: 'bug',
      column: 'inprogress',
      attachments: [],
    };

    it('should render edit task modal', () => {
      renderTaskModal(existingTask);
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });

    it('should populate form with existing task data', () => {
      renderTaskModal(existingTask);
      expect(screen.getByTestId('task-title-input')).toHaveValue('Existing Task');
      expect(screen.getByTestId('task-description-input')).toHaveValue('Existing Description');
    });

    it('should render submit button with "Update Task" text', () => {
      renderTaskModal(existingTask);
      expect(screen.getByTestId('submit-task-btn')).toHaveTextContent('Update Task');
    });
  });

  describe('Form Validation', () => {
    it('should show error when title is empty', async () => {
      renderTaskModal();
      
      fireEvent.click(screen.getByTestId('submit-task-btn'));
      
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(mockCreateTask).not.toHaveBeenCalled();
    });

    it('should not show error when title is provided', async () => {
      const user = userEvent.setup();
      renderTaskModal();
      
      await user.type(screen.getByTestId('task-title-input'), 'Valid Title');
      fireEvent.click(screen.getByTestId('submit-task-btn'));
      
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call createTask when creating new task', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderTaskModal(null, onClose);
      
      await user.type(screen.getByTestId('task-title-input'), 'New Task');
      await user.type(screen.getByTestId('task-description-input'), 'Task Description');
      
      fireEvent.click(screen.getByTestId('submit-task-btn'));
      
      expect(mockCreateTask).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Task',
        description: 'Task Description',
      }));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call updateTask when editing existing task', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const existingTask = {
        id: 'task-1',
        title: 'Existing Task',
        description: 'Existing Description',
        priority: 'high',
        category: 'bug',
        column: 'todo',
        attachments: [],
      };
      
      renderTaskModal(existingTask, onClose);
      
      await user.clear(screen.getByTestId('task-title-input'));
      await user.type(screen.getByTestId('task-title-input'), 'Updated Task');
      
      fireEvent.click(screen.getByTestId('submit-task-btn'));
      
      expect(mockUpdateTask).toHaveBeenCalledWith(expect.objectContaining({
        id: 'task-1',
        title: 'Updated Task',
      }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Modal Actions', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      renderTaskModal(null, onClose);
      
      fireEvent.click(screen.getByTestId('close-modal-btn'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', () => {
      const onClose = vi.fn();
      renderTaskModal(null, onClose);
      
      fireEvent.click(screen.getByTestId('cancel-btn'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking overlay', () => {
      const onClose = vi.fn();
      renderTaskModal(null, onClose);
      
      const modal = screen.getByTestId('task-modal');
      fireEvent.click(modal);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('File Upload', () => {
    it('should render file upload area', () => {
      renderTaskModal();
      expect(screen.getByText(/Click to upload or drag and drop/i)).toBeInTheDocument();
    });

    it('should show error for invalid file type', async () => {
      renderTaskModal();
      
      const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      const input = screen.getByTestId('file-upload-input');
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByTestId('upload-error')).toBeInTheDocument();
      });
    });

    it('should upload valid file successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          filename: 'uploaded.png',
          originalName: 'test.png',
          url: 'http://localhost:3001/uploads/uploaded.png',
          mimetype: 'image/png',
          size: 1024,
        }),
      });

      renderTaskModal();
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const input = screen.getByTestId('file-upload-input');
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByTestId('attachment-0')).toBeInTheDocument();
      });
    });

    it('should allow removing uploaded attachment', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          filename: 'uploaded.png',
          originalName: 'test.png',
          url: 'http://localhost:3001/uploads/uploaded.png',
          mimetype: 'image/png',
          size: 1024,
        }),
      });

      renderTaskModal();
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const input = screen.getByTestId('file-upload-input');
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByTestId('attachment-0')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('remove-attachment-0'));
      
      expect(screen.queryByTestId('attachment-0')).not.toBeInTheDocument();
    });
  });
});
