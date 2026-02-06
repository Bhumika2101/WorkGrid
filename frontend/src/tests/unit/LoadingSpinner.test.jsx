import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../../components/LoadingSpinner.jsx';

describe('LoadingSpinner Component', () => {
  describe('Rendering', () => {
    it('should render the spinner', () => {
      render(<LoadingSpinner />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should have correct role for accessibility', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-label for screen readers', () => {
      render(<LoadingSpinner />);
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size correctly', () => {
      render(<LoadingSpinner size="small" />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('w-5', 'h-5');
    });

    it('should render medium size by default', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('should render large size correctly', () => {
      render(<LoadingSpinner size="large" />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('w-12', 'h-12');
    });
  });

  describe('Animation', () => {
    it('should have spinner class for animation', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('spinner');
    });
  });
});
