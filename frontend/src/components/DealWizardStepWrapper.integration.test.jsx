/**
 * DealWizardStepWrapper Integration Tests
 * Comprehensive integration tests for error handling and recovery scenarios
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import DealWizardStepWrapper from './DealWizardStepWrapper';
import theme from '../theme';

// Mock the error reporter
jest.mock('../utils/dealWizardErrorReporter', () => ({
  dealWizardErrorReporter: {
    reportError: jest.fn()
  }
}));

// Mock the recovery hook
jest.mock('../hooks/useDealWizardRecovery', () => {
  const mockRecovery = {
    errorState: { hasError: false, error: null, recoveryAttempts: 0 },
    recoveryState: { isRecovering: false, maxRetryAttempts: 3 },
    handleError: jest.fn(),
    attemptRecovery: jest.fn().mockResolvedValue(true),
    resetErrorState: jest.fn(),
    navigateToSafeLocation: jest.fn(),
    preserveProgress: jest.fn(),
    restoreProgress: jest.fn(),
    getRecoverySuggestions: jest.fn().mockReturnValue([
      { type: 'info', message: 'Try refreshing the page', action: 'refresh' }
    ]),
    getProgress: jest.fn().mockReturnValue({ formData: {}, stepData: {} }),
    errorContext: { stepNumber: 1, stepName: 'Test Step', dealId: 'test-deal-123' }
  };

  return jest.fn(() => mockRecovery);
});

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  </BrowserRouter>
);

// Component that throws an error for testing
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error for integration testing');
  }
  return <div data-testid="test-content">Test content</div>;
};

describe('DealWizardStepWrapper Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Boundary Integration', () => {
    it('renders children normally when no error occurs', () => {
      render(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={1} 
            stepName="Test Step" 
            dealId="test-deal-123"
          >
            <ErrorComponent shouldThrow={false} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('catches errors and renders fallback UI', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={1} 
            stepName="Test Step" 
            dealId="test-deal-123"
          >
            <ErrorComponent shouldThrow={true} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      // Should render the error fallback
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Step 1: Test Step')).toBeInTheDocument();

      console.error = originalError;
    });

    it('calls error handler with enhanced context', () => {
      const mockOnError = jest.fn();
      const mockRecovery = require('../hooks/useDealWizardRecovery')();

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={2} 
            stepName="Error Test Step" 
            dealId="test-deal-456"
            onError={mockOnError}
          >
            <ErrorComponent shouldThrow={true} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      expect(mockRecovery.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          stepNumber: 2,
          stepName: 'Error Test Step',
          dealId: 'test-deal-456'
        })
      );

      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          stepNumber: 2,
          stepName: 'Error Test Step',
          dealId: 'test-deal-456'
        }),
        2
      );

      console.error = originalError;
    });
  });

  describe('Recovery Functionality Integration', () => {
    it('provides retry functionality through fallback UI', async () => {
      const mockRecovery = require('../hooks/useDealWizardRecovery')();
      mockRecovery.attemptRecovery.mockResolvedValue(true);

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={1} 
            stepName="Test Step" 
            dealId="test-deal-123"
          >
            <ErrorComponent shouldThrow={true} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      // Find and click the retry button
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockRecovery.attemptRecovery).toHaveBeenCalledWith('manual');
      });

      console.error = originalError;
    });

    it('handles recovery failure gracefully', async () => {
      const mockRecovery = require('../hooks/useDealWizardRecovery')();
      mockRecovery.attemptRecovery.mockResolvedValue(false);

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={1} 
            stepName="Test Step" 
            dealId="test-deal-123"
          >
            <ErrorComponent shouldThrow={true} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockRecovery.attemptRecovery).toHaveBeenCalledWith('manual');
      });

      // Should still show error UI after failed recovery
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      console.error = originalError;
    });

    it('provides navigation to safe location', () => {
      const mockRecovery = require('../hooks/useDealWizardRecovery')();

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={1} 
            stepName="Test Step" 
            dealId="test-deal-123"
          >
            <ErrorComponent shouldThrow={true} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      const dashboardButton = screen.getByText('Return to Dashboard');
      fireEvent.click(dashboardButton);

      expect(mockRecovery.navigateToSafeLocation).toHaveBeenCalledWith('/dashboard');

      console.error = originalError;
    });
  });

  describe('Error Reporting Integration', () => {
    it('reports errors to the centralized error reporter', () => {
      const { dealWizardErrorReporter } = require('../utils/dealWizardErrorReporter');

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={3} 
            stepName="Reporting Test Step" 
            dealId="test-deal-789"
          >
            <ErrorComponent shouldThrow={true} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      expect(dealWizardErrorReporter.reportError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          stepNumber: 3,
          stepName: 'Reporting Test Step',
          dealId: 'test-deal-789'
        })
      );

      console.error = originalError;
    });
  });

  describe('Recovery State Integration', () => {
    it('displays recovery state information in fallback UI', () => {
      const mockRecovery = require('../hooks/useDealWizardRecovery')();
      mockRecovery.recoveryState.isRecovering = true;
      mockRecovery.errorState.recoveryAttempts = 2;

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={1} 
            stepName="Test Step" 
            dealId="test-deal-123"
          >
            <ErrorComponent shouldThrow={true} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      expect(screen.getByText('Attempting Recovery...')).toBeInTheDocument();
      expect(screen.getByText(/Recovery attempts: 2\/3/)).toBeInTheDocument();

      console.error = originalError;
    });

    it('displays recovery suggestions in fallback UI', () => {
      const mockRecovery = require('../hooks/useDealWizardRecovery')();
      mockRecovery.getRecoverySuggestions.mockReturnValue([
        { type: 'info', message: 'Check your internet connection', action: 'retry' },
        { type: 'warning', message: 'Maximum retry attempts reached', action: 'refresh' }
      ]);

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={1} 
            stepName="Test Step" 
            dealId="test-deal-123"
          >
            <ErrorComponent shouldThrow={true} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      expect(screen.getByText('Suggested Solutions:')).toBeInTheDocument();
      expect(screen.getByText('Check your internet connection')).toBeInTheDocument();
      expect(screen.getByText('Maximum retry attempts reached')).toBeInTheDocument();

      console.error = originalError;
    });
  });

  describe('Error Context Integration', () => {
    it('passes correct error context to recovery hook', () => {
      const mockRecovery = require('../hooks/useDealWizardRecovery')();

      render(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={5} 
            stepName="Context Test Step" 
            dealId="test-deal-context"
          >
            <ErrorComponent shouldThrow={false} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      // Verify the recovery hook was called with correct parameters
      expect(mockRecovery).toHaveBeenCalledWith('test-deal-context', 5, 'Context Test Step');
    });

    it('updates error context when props change', () => {
      const mockRecovery = require('../hooks/useDealWizardRecovery')();

      const { rerender } = render(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={1} 
            stepName="Initial Step" 
            dealId="initial-deal"
          >
            <ErrorComponent shouldThrow={false} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      // Verify initial call
      expect(mockRecovery).toHaveBeenCalledWith('initial-deal', 1, 'Initial Step');

      // Update props
      rerender(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={2} 
            stepName="Updated Step" 
            dealId="updated-deal"
          >
            <ErrorComponent shouldThrow={false} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      // Verify updated call
      expect(mockRecovery).toHaveBeenCalledWith('updated-deal', 2, 'Updated Step');
    });
  });

  describe('Error Scenarios', () => {
    it('handles network errors with appropriate recovery suggestions', () => {
      const mockRecovery = require('../hooks/useDealWizardRecovery')();
      const networkError = new Error('fetch failed');
      networkError.name = 'NetworkError';
      
      mockRecovery.getRecoverySuggestions.mockReturnValue([
        { type: 'info', message: 'Check your internet connection', action: 'retry' },
        { type: 'info', message: 'Try refreshing the page', action: 'refresh' }
      ]);

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={1} 
            stepName="Network Test Step" 
            dealId="test-deal-network"
          >
            <ErrorComponent shouldThrow={true} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      expect(screen.getByText('Check your internet connection')).toBeInTheDocument();
      expect(screen.getByText('Try refreshing the page')).toBeInTheDocument();

      console.error = originalError;
    });

    it('handles validation errors with appropriate recovery suggestions', () => {
      const mockRecovery = require('../hooks/useDealWizardRecovery')();
      mockRecovery.getRecoverySuggestions.mockReturnValue([
        { type: 'info', message: 'Check your form inputs', action: 'validate' },
        { type: 'info', message: 'Ensure all required fields are filled', action: 'validate' }
      ]);

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <TestWrapper>
          <DealWizardStepWrapper 
            stepNumber={1} 
            stepName="Validation Test Step" 
            dealId="test-deal-validation"
          >
            <ErrorComponent shouldThrow={true} />
          </DealWizardStepWrapper>
        </TestWrapper>
      );

      expect(screen.getByText('Check your form inputs')).toBeInTheDocument();
      expect(screen.getByText('Ensure all required fields are filled')).toBeInTheDocument();

      console.error = originalError;
    });
  });
}); 