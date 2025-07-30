/**
 * DealWizardStepWrapper Component Tests
 * Tests the error boundary wrapper for individual DealWizard steps
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import DealWizardStepWrapper from './DealWizardStepWrapper';
import theme from '../theme';

// Mock ErrorBoundary component
jest.mock('./ErrorBoundary');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Chakra UI toast
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => mockToast,
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  </BrowserRouter>
);

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
};

describe('DealWizardStepWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children normally when no error occurs', () => {
    render(
      <TestWrapper>
        <DealWizardStepWrapper stepNumber={1} stepName="Test Step">
          <div>Test content</div>
        </DealWizardStepWrapper>
      </TestWrapper>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error fallback when child component throws error', () => {
    render(
      <TestWrapper>
        <DealWizardStepWrapper stepNumber={1} stepName="Test Step" shouldThrow={true}>
          <div>Normal content</div>
        </DealWizardStepWrapper>
      </TestWrapper>
    );
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Step 1: Test Step')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn();
    render(
      <TestWrapper>
        <DealWizardStepWrapper stepNumber={2} stepName="Test Step" onError={onError} shouldThrow={true}>
          <div>Normal content</div>
        </DealWizardStepWrapper>
      </TestWrapper>
    );
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('logs step-specific error message to console', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <DealWizardStepWrapper stepNumber={3} stepName="Custom Step">
          <ThrowError shouldThrow={true} />
        </DealWizardStepWrapper>
      </TestWrapper>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error in DealWizard Step 3 (Custom Step):',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('passes correct props to ErrorBoundary', () => {
    const { container } = render(
      <TestWrapper>
        <DealWizardStepWrapper
          stepNumber={5}
          stepName="Compliance Review"
          onError={jest.fn()}
        >
          <div>Test content</div>
        </DealWizardStepWrapper>
      </TestWrapper>
    );

    // Verify ErrorBoundary is rendered with correct context
    expect(container.innerHTML).toContain('Test content');
  });

  it('passes step information to DealWizardErrorFallback', () => {
    render(
      <TestWrapper>
        <DealWizardStepWrapper stepNumber={8} stepName="Review & Submit" shouldThrow={true}>
          <div>Normal content</div>
        </DealWizardStepWrapper>
      </TestWrapper>
    );
    expect(screen.getByText('Step 8: Review & Submit')).toBeInTheDocument();
  });

  it('handles missing stepName gracefully', () => {
    render(
      <TestWrapper>
        <DealWizardStepWrapper stepNumber={0} shouldThrow={true}>
          <div>Normal content</div>
        </DealWizardStepWrapper>
      </TestWrapper>
    );
    expect(screen.getByText('Step 0: Step 0')).toBeInTheDocument();
  });

  it('provides retry functionality through error fallback', () => {
    render(
      <TestWrapper>
        <DealWizardStepWrapper stepNumber={1} stepName="Test Step" shouldThrow={true}>
          <div>Normal content</div>
        </DealWizardStepWrapper>
      </TestWrapper>
    );
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
  });

  it('maintains existing functionality when no error occurs', () => {
    const TestComponent = () => (
      <div>
        <h1>Test Title</h1>
        <button>Test Button</button>
      </div>
    );

    render(
      <TestWrapper>
        <DealWizardStepWrapper stepNumber={1} stepName="Test Step">
          <TestComponent />
        </DealWizardStepWrapper>
      </TestWrapper>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('handles multiple nested components correctly', () => {
    const NestedComponent = () => (
      <div>
        <span>Nested content</span>
        <button>Nested button</button>
      </div>
    );

    render(
      <TestWrapper>
        <DealWizardStepWrapper stepNumber={2} stepName="Nested Test">
          <NestedComponent />
        </DealWizardStepWrapper>
      </TestWrapper>
    );

    expect(screen.getByText('Nested content')).toBeInTheDocument();
    expect(screen.getByText('Nested button')).toBeInTheDocument();
  });

  it('provides step-specific error context', () => {
    render(
      <TestWrapper>
        <DealWizardStepWrapper stepNumber={6} stepName="Compensation Details" shouldThrow={true}>
          <div>Normal content</div>
        </DealWizardStepWrapper>
      </TestWrapper>
    );
    expect(screen.getByText(/We encountered an issue while processing compensation details/)).toBeInTheDocument();
  });
});