import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../App.jsx';
import { TaskProvider } from '../../../context/TaskContext.jsx';
import { SocketProvider } from '../../../context/SocketContext.jsx';

// Mock Socket.IO
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connected: true,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div data-testid="recharts-bar">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  PieChart: ({ children }) => <div data-testid="recharts-pie">{children}</div>,
  Pie: () => null,
  Cell: () => null,
}));

// Mock @hello-pangea/dnd
vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }) => <div>{children}</div>,
  Droppable: ({ children }) =>
    children(
      {
        innerRef: vi.fn(),
        droppableProps: {},
        placeholder: null,
      },
      { isDraggingOver: false }
    ),
  Draggable: ({ children }) =>
    children(
      {
        innerRef: vi.fn(),
        draggableProps: {},
        dragHandleProps: {},
      },
      { isDragging: false }
    ),
}));

const renderApp = () => {
  return render(
    <SocketProvider>
      <TaskProvider>
        <App />
      </TaskProvider>
    </SocketProvider>
  );
};

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Set up socket event handlers
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === 'connect') {
        // Simulate immediate connection
        setTimeout(() => callback(), 0);
      }
      if (event === 'sync:tasks') {
        // Simulate receiving initial tasks
        setTimeout(() => callback([]), 0);
      }
      return mockSocket;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Load', () => {
    it('should render the app without crashing', async () => {
      renderApp();
      await waitFor(() => {
        expect(screen.getByText('Kanban Board')).toBeInTheDocument();
      });
    });

    it('should render all three columns', async () => {
      renderApp();
      await waitFor(() => {
        expect(screen.getByTestId('column-todo')).toBeInTheDocument();
        expect(screen.getByTestId('column-inprogress')).toBeInTheDocument();
        expect(screen.getByTestId('column-done')).toBeInTheDocument();
      });
    });

    it('should render the add task button', async () => {
      renderApp();
      await waitFor(() => {
        expect(screen.getByTestId('add-task-btn')).toBeInTheDocument();
      });
    });
  });

  describe('Task Modal Integration', () => {
    it('should open task modal when add task button is clicked', async () => {
      const user = userEvent.setup();
      renderApp();
      
      await waitFor(() => {
        expect(screen.getByTestId('add-task-btn')).toBeInTheDocument();
      });
      
      await user.click(screen.getByTestId('add-task-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('task-modal')).toBeInTheDocument();
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });
    });

    it('should close task modal when close button is clicked', async () => {
      const user = userEvent.setup();
      renderApp();
      
      await waitFor(() => {
        expect(screen.getByTestId('add-task-btn')).toBeInTheDocument();
      });
      
      await user.click(screen.getByTestId('add-task-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('task-modal')).toBeInTheDocument();
      });
      
      await user.click(screen.getByTestId('close-modal-btn'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
      });
    });

    it('should close task modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderApp();
      
      await waitFor(() => {
        expect(screen.getByTestId('add-task-btn')).toBeInTheDocument();
      });
      
      await user.click(screen.getByTestId('add-task-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('task-modal')).toBeInTheDocument();
      });
      
      await user.click(screen.getByTestId('cancel-btn'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Dark Mode Integration', () => {
    it('should toggle dark mode when button is clicked', async () => {
      const user = userEvent.setup();
      renderApp();
      
      await waitFor(() => {
        expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument();
      });
      
      await user.click(screen.getByTestId('dark-mode-toggle'));
      
      // Check that dark mode class is added to document
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      
      // Toggle back
      await user.click(screen.getByTestId('dark-mode-toggle'));
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should persist dark mode preference', async () => {
      const user = userEvent.setup();
      renderApp();
      
      await waitFor(() => {
        expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument();
      });
      
      await user.click(screen.getByTestId('dark-mode-toggle'));
      
      expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
    });
  });

  describe('Chart Toggle Integration', () => {
    it('should toggle chart visibility when button is clicked', async () => {
      const user = userEvent.setup();
      renderApp();
      
      await waitFor(() => {
        expect(screen.getByTestId('toggle-chart-btn')).toBeInTheDocument();
      });
      
      // Chart should be visible by default
      expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
      
      // Hide chart
      await user.click(screen.getByTestId('toggle-chart-btn'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('progress-chart')).not.toBeInTheDocument();
      });
      
      // Show chart again
      await user.click(screen.getByTestId('toggle-chart-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
      });
    });
  });
});
