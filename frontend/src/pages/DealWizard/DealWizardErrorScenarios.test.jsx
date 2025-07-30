/**
 * DealWizard Error Scenarios Tests
 * End-to-end error scenario tests for the complete DealWizard workflow
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Step0_SocialMedia from './Step0_SocialMedia';
import Step1_DealTerms from './Step1_DealTerms';
import Step8_Review from './Step8_Review';
import theme from '../../theme';

// Mock the error reporter
jest.mock('../../utils/dealWizardErrorReporter', () => ({
  dealWizardErrorReporter: {
    reportError: jest.fn()
  }
}));

// Mock the recovery hook
jest.mock('../../hooks/useDealWizardRecovery', () => {
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
    errorContext: { stepNumber: 0, stepName: 'Social Media Setup', dealId: 'test-deal-123' }
  };

  return jest.fn(() => mockRecovery);
});

// Mock Supabase client
jest.mock('../../supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: null, error: null })
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn().mockResolvedValue({ data: null, error: null })
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn().mockResolvedValue({ data: null, error: null })
        }))
      }))
    }))
  }
}));

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ dealId: 'test-deal-123' }),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams(), jest.fn()]
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  </BrowserRouter>
);

describe('DealWizard Error Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Step 0 - Social Media Setup Error Scenarios', () => {
    it('handles network errors during social media data loading', async () => {
      // Mock a network error
      const mockSupabase = require('../../supabaseClient').supabase;
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Network error - fetch failed');
      });

      render(
        <TestWrapper>
          <Step0_SocialMedia />
        </TestWrapper>
      );

      // Should render the error fallback
      await waitFor(() => {
        expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      });

      expect(screen.getByText('Step 0: Social Media Setup')).toBeInTheDocument();
    });

    it('handles validation errors in social media form', async () => {
      render(
        <TestWrapper>
          <Step0_SocialMedia />
        </TestWrapper>
      );

      // Find and interact with form elements
      const submitButton = screen.getByText(/continue/i);
      fireEvent.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });

    it('provides recovery options for social media step errors', async () => {
      // Mock an error in the component
      const originalError = console.error;
      console.error = jest.fn();

      // Create a component that throws an error
      const ErrorStep0 = () => {
        throw new Error('Social media setup error');
      };

      render(
        <TestWrapper>
          <ErrorStep0 />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
        expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Start New Deal')).toBeInTheDocument();
      });

      console.error = originalError;
    });
  });

  describe('Step 1 - Deal Terms Error Scenarios', () => {
    it('handles form validation errors in deal terms', async () => {
      render(
        <TestWrapper>
          <Step1_DealTerms />
        </TestWrapper>
      );

      // Try to submit without required fields
      const submitButton = screen.getByText(/continue/i);
      fireEvent.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });

    it('handles API errors during deal terms submission', async () => {
      // Mock API error
      const mockSupabase = require('../../supabaseClient').supabase;
      mockSupabase.from.mockImplementation(() => ({
        insert: jest.fn(() => ({
          select: jest.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Database connection failed' } 
          })
        }))
      }));

      render(
        <TestWrapper>
          <Step1_DealTerms />
        </TestWrapper>
      );

      // Fill in required fields and submit
      const submitButton = screen.getByText(/continue/i);
      fireEvent.click(submitButton);

      // Should handle the API error gracefully
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 8 - Review Error Scenarios', () => {
    it('handles errors during deal review and submission', async () => {
      // Mock a submission error
      const mockSupabase = require('../../supabaseClient').supabase;
      mockSupabase.from.mockImplementation(() => ({
        insert: jest.fn(() => ({
          select: jest.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Submission failed - server error' } 
          })
        }))
      }));

      render(
        <TestWrapper>
          <Step8_Review />
        </TestWrapper>
      );

      // Try to submit the deal
      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      // Should handle the submission error
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('provides recovery options for review step errors', async () => {
      // Mock an error in the review component
      const originalError = console.error;
      console.error = jest.fn();

      // Create a component that throws an error
      const ErrorStep8 = () => {
        throw new Error('Review step error');
      };

      render(
        <TestWrapper>
          <ErrorStep8 />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
        expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Start New Deal')).toBeInTheDocument();
      });

      console.error = originalError;
    });
  });

  describe('Cross-Step Error Recovery', () => {
    it('maintains progress across error recovery attempts', async () => {
      const mockRecovery = require('../../hooks/useDealWizardRecovery')();
      
      render(
        <TestWrapper>
          <Step0_SocialMedia />
        </TestWrapper>
      );

      // Simulate an error
      const originalError = console.error;
      console.error = jest.fn();

      // Trigger an error
      fireEvent.click(screen.getByText(/continue/i));

      // Verify progress preservation was called
      expect(mockRecovery.preserveProgress).toHaveBeenCalled();

      console.error = originalError;
    });

    it('provides consistent error recovery across all steps', async () => {
      const steps = [
        { component: Step0_SocialMedia, name: 'Social Media Setup' },
        { component: Step1_DealTerms, name: 'Deal Terms' },
        { component: Step8_Review, name: 'Review & Submit' }
      ];

      for (const step of steps) {
        const originalError = console.error;
        console.error = jest.fn();

        // Create error component
        const ErrorComponent = () => {
          throw new Error(`Error in ${step.name}`);
        };

        render(
          <TestWrapper>
            <ErrorComponent />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
          expect(screen.getByText('Try Again')).toBeInTheDocument();
          expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
        });

        console.error = originalError;
      }
    });
  });

  describe('Error Reporting Integration', () => {
    it('reports errors with step-specific context', async () => {
      const { dealWizardErrorReporter } = require('../../utils/dealWizardErrorReporter');

      const originalError = console.error;
      console.error = jest.fn();

      // Create error component
      const ErrorComponent = () => {
        throw new Error('Test error for reporting');
      };

      render(
        <TestWrapper>
          <ErrorComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(dealWizardErrorReporter.reportError).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            stepNumber: expect.any(Number),
            stepName: expect.any(String),
            dealId: 'test-deal-123'
          })
        );
      });

      console.error = originalError;
    });

    it('provides error analytics across the entire workflow', async () => {
      const { dealWizardErrorReporter } = require('../../utils/dealWizardErrorReporter');

      // Simulate multiple errors across different steps
      const steps = [
        { stepNumber: 0, stepName: 'Social Media Setup' },
        { stepNumber: 1, stepName: 'Deal Terms' },
        { stepNumber: 8, stepName: 'Review & Submit' }
      ];

      for (const step of steps) {
        const originalError = console.error;
        console.error = jest.fn();

        // Create error component
        const ErrorComponent = () => {
          throw new Error(`Error in ${step.stepName}`);
        };

        render(
          <TestWrapper>
            <ErrorComponent />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(dealWizardErrorReporter.reportError).toHaveBeenCalledWith(
            expect.any(Error),
            expect.objectContaining({
              stepNumber: step.stepNumber,
              stepName: step.stepName,
              dealId: 'test-deal-123'
            })
          );
        });

        console.error = originalError;
      }
    });
  });

  describe('User Experience Error Scenarios', () => {
    it('provides helpful error messages for different error types', async () => {
      const errorTypes = [
        { type: 'network', message: 'Network error - fetch failed' },
        { type: 'validation', message: 'Validation error - required field missing' },
        { type: 'runtime', message: 'Runtime error - undefined is not a function' }
      ];

      for (const errorType of errorTypes) {
        const originalError = console.error;
        console.error = jest.fn();

        // Create error component
        const ErrorComponent = () => {
          const error = new Error(errorType.message);
          if (errorType.type === 'network') error.name = 'NetworkError';
          if (errorType.type === 'validation') error.name = 'ValidationError';
          if (errorType.type === 'runtime') error.name = 'TypeError';
          throw error;
        };

        render(
          <TestWrapper>
            <ErrorComponent />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
          expect(screen.getByText('Try Again')).toBeInTheDocument();
        });

        console.error = originalError;
      }
    });

    it('maintains user progress during error recovery', async () => {
      const mockRecovery = require('../../hooks/useDealWizardRecovery')();

      render(
        <TestWrapper>
          <Step0_SocialMedia />
        </TestWrapper>
      );

      // Fill in some form data
      const inputs = screen.getAllByRole('textbox');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: 'test data' } });
      }

      // Simulate an error
      const originalError = console.error;
      console.error = jest.fn();

      // Trigger an error
      fireEvent.click(screen.getByText(/continue/i));

      // Verify progress was preserved
      expect(mockRecovery.preserveProgress).toHaveBeenCalled();

      console.error = originalError;
    });
  });
}); 