/**
 * Tests for DealWizardErrorFallback Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import DealWizardErrorFallback from './DealWizardErrorFallback';
import theme from '../theme';

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

const defaultProps = {
  error: new Error('Test error message'),
  errorId: 'test-error-123',
  onRetry: jest.fn(),
  isRetrying: false,
  currentStep: 0,
  stepName: 'Test Step',
  showDetails: false
};

describe('DealWizardErrorFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('displays step-specific error message', () => {
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} currentStep={1} />
      </TestWrapper>
    );

    expect(screen.getByText(/We encountered an issue while processing your deal terms/)).toBeInTheDocument();
  });

  it('shows step information when currentStep is provided', () => {
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} currentStep={2} />
      </TestWrapper>
    );

    expect(screen.getByText(/Step 2: Payor Information/)).toBeInTheDocument();
  });

  it('displays progress preservation message', () => {
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Don\'t worry, your progress is saved!')).toBeInTheDocument();
    expect(screen.getByText(/Your deal data has been automatically saved as a draft/)).toBeInTheDocument();
  });

  it('renders all action buttons', () => {
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Start New Deal')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('calls onRetry when Try Again button is clicked', () => {
    const onRetry = jest.fn();
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} onRetry={onRetry} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isRetrying is true', () => {
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} isRetrying={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Retrying...')).toBeInTheDocument();
  });

  it('navigates to dashboard when Return to Dashboard is clicked', () => {
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Return to Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard?tab=drafts');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Returning to Dashboard',
      description: 'Your deal progress has been saved as a draft.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  });

  it('navigates to dashboard when Start New Deal is clicked', () => {
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Start New Deal'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Starting Fresh',
      description: 'Creating a new deal from the beginning.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  });

  it('navigates to home when Go Home is clicked', () => {
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Go Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows technical details when showDetails is true', () => {
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} showDetails={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Technical Details (Development Only):')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('Error ID: test-error-123')).toBeInTheDocument();
  });

  it('does not show technical details when showDetails is false', () => {
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} showDetails={false} />
      </TestWrapper>
    );

    expect(screen.queryByText('Technical Details (Development Only):')).not.toBeInTheDocument();
  });

  it('handles different step numbers correctly', () => {
    const { rerender } = render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} currentStep={0} />
      </TestWrapper>
    );

    expect(screen.getByText(/We encountered an issue while setting up your social media information/)).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} currentStep={6} />
      </TestWrapper>
    );

    expect(screen.getByText(/We encountered an issue while processing compensation details/)).toBeInTheDocument();
  });

  it('uses fallback message for unknown step numbers', () => {
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} currentStep={99} />
      </TestWrapper>
    );

    expect(screen.getByText(/We encountered an issue with the deal creation process/)).toBeInTheDocument();
  });

  it('disables retry button when isRetrying is true', () => {
    render(
      <TestWrapper>
        <DealWizardErrorFallback {...defaultProps} isRetrying={true} />
      </TestWrapper>
    );

    const retryButton = screen.getByText('Retrying...');
    expect(retryButton).toBeDisabled();
  });
}); 