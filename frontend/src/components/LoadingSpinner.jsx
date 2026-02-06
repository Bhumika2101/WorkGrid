import React from 'react';

function LoadingSpinner({ size = 'medium' }) {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div
      className={`spinner ${sizeClasses[size]}`}
      data-testid="loading-spinner"
      role="status"
      aria-label="Loading"
    />
  );
}

export default LoadingSpinner;
