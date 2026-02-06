import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressChart from '../../../components/ProgressChart.jsx';
import { TaskProvider } from '../../../context/TaskContext.jsx';
import { SocketProvider } from '../../../context/SocketContext.jsx';

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
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

// Mock the useTasks hook
vi.mock('../../../context/TaskContext.jsx', async () => {
  const actual = await vi.importActual('../../../context/TaskContext.jsx');
  return {
    ...actual,
    useTasks: () => ({
      getTaskCounts: () => ({
        todo: 3,
        inprogress: 2,
        done: 5,
        total: 10,
      }),
    }),
  };
});

const renderProgressChart = () => {
  return render(
    <SocketProvider>
      <TaskProvider>
        <ProgressChart />
      </TaskProvider>
    </SocketProvider>
  );
};

describe('ProgressChart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the progress chart container', () => {
      renderProgressChart();
      expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
    });

    it('should render the title', () => {
      renderProgressChart();
      expect(screen.getByText('Task Progress')).toBeInTheDocument();
    });

    it('should render bar chart', () => {
      renderProgressChart();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should render pie chart', () => {
      renderProgressChart();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should display total tasks count', () => {
      renderProgressChart();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should display todo count stat', () => {
      renderProgressChart();
      expect(screen.getByTestId('stat-todo')).toBeInTheDocument();
      expect(screen.getByTestId('stat-todo')).toHaveTextContent('3');
    });

    it('should display in progress count stat', () => {
      renderProgressChart();
      expect(screen.getByTestId('stat-inprogress')).toBeInTheDocument();
      expect(screen.getByTestId('stat-inprogress')).toHaveTextContent('2');
    });

    it('should display done count stat', () => {
      renderProgressChart();
      expect(screen.getByTestId('stat-done')).toBeInTheDocument();
      expect(screen.getByTestId('stat-done')).toHaveTextContent('5');
    });

    it('should display completion rate', () => {
      renderProgressChart();
      // 5 done out of 10 total = 50%
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Column Labels', () => {
    it('should display "To Do" label', () => {
      renderProgressChart();
      expect(screen.getByText('To Do')).toBeInTheDocument();
    });

    it('should display "In Progress" label', () => {
      renderProgressChart();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should display "Done" label', () => {
      renderProgressChart();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });
});

describe('ProgressChart with Zero Tasks', () => {
  beforeEach(() => {
    vi.doMock('../../../context/TaskContext.jsx', async () => {
      const actual = await vi.importActual('../../../context/TaskContext.jsx');
      return {
        ...actual,
        useTasks: () => ({
          getTaskCounts: () => ({
            todo: 0,
            inprogress: 0,
            done: 0,
            total: 0,
          }),
        }),
      };
    });
  });

  it('should handle zero total tasks', () => {
    renderProgressChart();
    // Component should still render without errors
    expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
  });
});
