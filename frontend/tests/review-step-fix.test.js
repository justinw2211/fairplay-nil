import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Step8_Review from '../src/pages/DealWizard/Step8_Review';
import { DealProvider } from '../src/context/DealContext';
import { AuthProvider } from '../src/context/AuthContext';

// Mock the DealWizardStepWrapper component
jest.mock('../src/components/DealWizardStepWrapper', () => {
  return function MockDealWizardStepWrapper({ children }) {
    return <div data-testid="deal-wizard-wrapper">{children}</div>;
  };
});

// Mock the useDeal hook
const mockUseDeal = {
  deal: {
    id: 1,
    status: 'draft',
    compensation_cash: 5000,
    compensation_goods: [
      { description: 'Product A', value: 1000 }
    ],
    compensation_other: [
      { payment_type: 'bonus', description: 'Performance Bonus', estimated_value: 2000 }
    ],
    obligations: {
      endorsements: {
        duration: '12 months'
      },
      uses_school_ip: 'yes',
      grant_exclusivity: 'no',
      licenses_nil: 'yes'
    },
    payor_name: 'Test Company',
    payor_type: 'Collective',
    university: 'Test University',
    sports: 'Football',
    deal_nickname: 'Test Deal',
    contact_name: 'John Doe',
    contact_email: 'john@example.com'
  },
  loading: false,
  error: null
};

jest.mock('../src/context/DealContext', () => ({
  ...jest.requireActual('../src/context/DealContext'),
  useDeal: () => mockUseDeal
}));

// Mock the useAuth hook
jest.mock('../src/context/AuthContext', () => ({
  ...jest.requireActual('../src/context/AuthContext'),
  useAuth: () => ({
    user: { id: 1, email: 'test@example.com' },
    loading: false
  })
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ dealId: '1' }),
  useSearchParams: () => [new URLSearchParams('type=standard'), jest.fn()],
  useNavigate: () => jest.fn()
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ChakraProvider>
        <AuthProvider>
          <DealProvider>
            {component}
          </DealProvider>
        </AuthProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
};

describe('Review Step Fix Tests', () => {
  test('should display compensation data correctly', () => {
    renderWithProviders(<Step8_Review />);
    
    // Check that compensation data is displayed
    expect(screen.getByText('Cash Payment')).toBeInTheDocument();
    expect(screen.getByText('Goods/Products')).toBeInTheDocument();
    expect(screen.getByText('Performance Bonus')).toBeInTheDocument();
    
    // Check that values are formatted correctly
    expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    expect(screen.getByText('$2,000.00')).toBeInTheDocument();
  });

  test('should display deal duration correctly', () => {
    renderWithProviders(<Step8_Review />);
    
    // Check that deal duration is displayed
    expect(screen.getByText('12 months')).toBeInTheDocument();
  });

  test('should display payor and institution data correctly', () => {
    renderWithProviders(<Step8_Review />);
    
    // Check that payor data is displayed
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Collective')).toBeInTheDocument();
    
    // Check that institution data is displayed
    expect(screen.getByText('Test University')).toBeInTheDocument();
    expect(screen.getByText('Football')).toBeInTheDocument();
  });

  test('should display deal nickname and contact info correctly', () => {
    renderWithProviders(<Step8_Review />);
    
    // Check that deal nickname is displayed
    expect(screen.getByText('Test Deal')).toBeInTheDocument();
    
    // Check that contact info is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  test('should display compliance information correctly', () => {
    renderWithProviders(<Step8_Review />);
    
    // Check that compliance information is displayed
    expect(screen.getByText('Uses School Ip')).toBeInTheDocument();
    expect(screen.getByText('Grant Exclusivity')).toBeInTheDocument();
    expect(screen.getByText('Licenses Nil')).toBeInTheDocument();
  });

  test('should display edit buttons for clickable sections', () => {
    renderWithProviders(<Step8_Review />);
    
    // Check that edit buttons are present
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBeGreaterThan(0);
  });

  test('should handle missing data gracefully', () => {
    // Mock deal with missing data
    const mockDealWithMissingData = {
      ...mockUseDeal.deal,
      compensation_cash: null,
      compensation_goods: null,
      compensation_other: null,
      obligations: null,
      payor_name: null,
      payor_type: null,
      university: null,
      sports: null,
      deal_nickname: null,
      contact_name: null,
      contact_email: null
    };

    // Temporarily override the mock
    const originalDeal = mockUseDeal.deal;
    mockUseDeal.deal = mockDealWithMissingData;

    renderWithProviders(<Step8_Review />);
    
    // Check that default values are displayed
    expect(screen.getByText('Untitled Deal')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
    expect(screen.getByText('Duration not specified')).toBeInTheDocument();
    expect(screen.getAllByText('Not specified')).toHaveLength(5);

    // Restore original mock
    mockUseDeal.deal = originalDeal;
  });

  test('should calculate total compensation correctly', () => {
    renderWithProviders(<Step8_Review />);
    
    // Check that total compensation is calculated correctly (5000 + 1000 + 2000 = 8000)
    expect(screen.getByText('$8,000.00')).toBeInTheDocument();
  });

  test('should display activities and obligations correctly', () => {
    renderWithProviders(<Step8_Review />);
    
    // Check that activities section is present
    expect(screen.getByText('Activities & Obligations')).toBeInTheDocument();
  });

  test('should display compensation details section correctly', () => {
    renderWithProviders(<Step8_Review />);
    
    // Check that compensation details section is present
    expect(screen.getByText('Compensation Details')).toBeInTheDocument();
  });

  test('should display compliance information section correctly', () => {
    renderWithProviders(<Step8_Review />);
    
    // Check that compliance information section is present
    expect(screen.getByText('Compliance Information')).toBeInTheDocument();
  });
}); 