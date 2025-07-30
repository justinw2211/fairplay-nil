/**
 * Tests for DealWizardErrorFallback Component
 */

import { screen, fireEvent } from '@testing-library/react';
import { renderWithChakraAndRouter } from '../utils/test-utils';
import DealWizardErrorFallback from './DealWizardErrorFallback';

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
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} />);

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('displays step-specific error message', () => {
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} currentStep={1} />);

    expect(screen.getByText(/We encountered an issue while processing your deal terms/)).toBeInTheDocument();
  });

  it('shows step information when currentStep is provided', () => {
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} currentStep={2} stepName="Payor Information" />);

    expect(screen.getByText(/Step 2: Payor Information/)).toBeInTheDocument();
  });

  it('displays progress preservation message', () => {
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} />);

    expect(screen.getByText('Your Progress is Safe')).toBeInTheDocument();
    expect(screen.getByText(/Don't worry! Your progress has been automatically saved/)).toBeInTheDocument();
  });

  it('renders all action buttons', () => {
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} />);

    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Start New Deal')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('calls onRetry when Try Again button is clicked', () => {
    const onRetry = jest.fn();
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} onRetry={onRetry} />);

    fireEvent.click(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when recoveryState.isRecovering is true', () => {
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} recoveryState={{ isRecovering: true }} />);

    expect(screen.getAllByText('Attempting Recovery...')).toHaveLength(2);
  });

  it('navigates to dashboard when Return to Dashboard is clicked', () => {
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} />);

    fireEvent.click(screen.getByText('Return to Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to add deal when Start New Deal is clicked', () => {
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} />);

    fireEvent.click(screen.getByText('Start New Deal'));
    expect(mockNavigate).toHaveBeenCalledWith('/add/deal');
  });

  it('navigates to home when Go Home is clicked', () => {
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} />);

    fireEvent.click(screen.getByText('Go Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows technical details when showDetails is true', () => {
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} showDetails={true} />);

    expect(screen.getByText('Technical Details:')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('does not show technical details when showDetails is false', () => {
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} showDetails={false} />);

    expect(screen.queryByText('Technical Details:')).not.toBeInTheDocument();
  });

  it('handles different step numbers correctly', () => {
    const { rerender } = renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} currentStep={0} />);

    expect(screen.getByText(/We encountered an issue while setting up your social media information/)).toBeInTheDocument();

    rerender(<DealWizardErrorFallback {...defaultProps} currentStep={6} />);

    expect(screen.getByText(/We encountered an issue while processing compensation details/)).toBeInTheDocument();
  });

  it('uses fallback message for unknown step numbers', () => {
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} currentStep={99} />);

    expect(screen.getByText(/We encountered an issue while processing your information/)).toBeInTheDocument();
  });

  it('disables retry button when recoveryState.isRecovering is true', () => {
    renderWithChakraAndRouter(<DealWizardErrorFallback {...defaultProps} recoveryState={{ isRecovering: true }} />);

    const retryButton = screen.getByRole('button', { name: /attempting recovery/i });
    expect(retryButton).toBeDisabled();
  });
});