import React from 'react';

const ErrorBoundary = ({ children, context, onError, fallbackRender, shouldThrow }) => {
  if (shouldThrow && fallbackRender) {
    const error = new Error('Test error');
    if (onError) {onError(error, {});}
    return fallbackRender({ error, errorId: 'test-error-123' });
  }
  return children;
};

export default ErrorBoundary;