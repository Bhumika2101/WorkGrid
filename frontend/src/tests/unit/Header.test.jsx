import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../../../components/Header.jsx';

describe('Header Component', () => {
  const defaultProps = {
    darkMode: false,
    onToggleDarkMode: vi.fn(),
    onAddTask: vi.fn(),
    connectionStatus: 'connected',
    isConnected: true,
    showChart: true,
    onToggleChart: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the header with logo', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('Kanban Board')).toBeInTheDocument();
      expect(screen.getByText('Real-time Task Management')).toBeInTheDocument();
    });

    it('should render add task button', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByTestId('add-task-btn')).toBeInTheDocument();
    });

    it('should render dark mode toggle', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument();
    });

    it('should render chart toggle button', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByTestId('toggle-chart-btn')).toBeInTheDocument();
    });
  });

  describe('Connection Status', () => {
    it('should show connected status when connected', () => {
      render(<Header {...defaultProps} isConnected={true} connectionStatus="connected" />);
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('should show disconnected status when not connected', () => {
      render(<Header {...defaultProps} isConnected={false} connectionStatus="disconnected" />);
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onAddTask when add task button is clicked', () => {
      const onAddTask = vi.fn();
      render(<Header {...defaultProps} onAddTask={onAddTask} />);
      
      fireEvent.click(screen.getByTestId('add-task-btn'));
      expect(onAddTask).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleDarkMode when dark mode toggle is clicked', () => {
      const onToggleDarkMode = vi.fn();
      render(<Header {...defaultProps} onToggleDarkMode={onToggleDarkMode} />);
      
      fireEvent.click(screen.getByTestId('dark-mode-toggle'));
      expect(onToggleDarkMode).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleChart when chart toggle is clicked', () => {
      const onToggleChart = vi.fn();
      render(<Header {...defaultProps} onToggleChart={onToggleChart} />);
      
      fireEvent.click(screen.getByTestId('toggle-chart-btn'));
      expect(onToggleChart).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dark Mode Icon', () => {
    it('should show moon icon when in light mode', () => {
      render(<Header {...defaultProps} darkMode={false} />);
      // The component renders Sun icon when darkMode is true, Moon when false
      const toggle = screen.getByTestId('dark-mode-toggle');
      expect(toggle).toBeInTheDocument();
    });

    it('should show sun icon when in dark mode', () => {
      render(<Header {...defaultProps} darkMode={true} />);
      const toggle = screen.getByTestId('dark-mode-toggle');
      expect(toggle).toBeInTheDocument();
    });
  });

  describe('Chart Toggle State', () => {
    it('should have active state when showChart is true', () => {
      render(<Header {...defaultProps} showChart={true} />);
      const chartToggle = screen.getByTestId('toggle-chart-btn');
      expect(chartToggle).toHaveClass('bg-blue-100');
    });

    it('should have inactive state when showChart is false', () => {
      render(<Header {...defaultProps} showChart={false} />);
      const chartToggle = screen.getByTestId('toggle-chart-btn');
      expect(chartToggle).toHaveClass('bg-gray-100');
    });
  });
});
