/**
 * Test Utilities for FairPlay NIL Platform
 * Centralized testing utilities for consistent component testing
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import theme from '../theme';

/**
 * Render component with all necessary providers
 * @param {React.ReactElement} component - Component to render
 * @param {Object} options - Additional options for render
 * @returns {Object} Render result with all testing utilities
 */
export const renderWithProviders = (component, options = {}) => {
  const AllTheProviders = ({ children }) => {
    return (
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ChakraProvider>
    );
  };

  return render(component, { wrapper: AllTheProviders, ...options });
};

/**
 * Render component with only ChakraProvider (for simple UI components)
 * @param {React.ReactElement} component - Component to render
 * @param {Object} options - Additional options for render
 * @returns {Object} Render result with testing utilities
 */
export const renderWithChakra = (component, options = {}) => {
  const ChakraWrapper = ({ children }) => (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );

  return render(component, { wrapper: ChakraWrapper, ...options });
};

/**
 * Render component with ChakraProvider and BrowserRouter (for navigation components)
 * @param {React.ReactElement} component - Component to render
 * @param {Object} options - Additional options for render
 * @returns {Object} Render result with testing utilities
 */
export const renderWithChakraAndRouter = (component, options = {}) => {
  const ChakraRouterWrapper = ({ children }) => (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </ChakraProvider>
  );

  return render(component, { wrapper: ChakraRouterWrapper, ...options });
};

/**
 * Mock AuthContext for testing
 */
export const mockAuthContext = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User'
    }
  },
  loading: false,
  error: null,
  signIn: async (_data) => ({ data: { user: mockAuthContext.user }, error: null }),
  signUp: async (_email, _password, _metadata) => ({ data: { user: mockAuthContext.user }, error: null }),
  signOut: async () => {},
};

/**
 * Mock DealContext for testing
 */
export const mockDealContext = {
  deal: null,
  loading: false,
  error: null,
  createDraftDeal: async (dealOptions = {}) => {
    const mockDeal = {
      id: 'test-deal-123',
      deal_type: dealOptions.deal_type || 'standard',
      status: 'draft',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };
    return mockDeal;
  },
  updateDeal: async (dealId, updateData) => {
    const mockDeal = {
      id: dealId,
      ...updateData,
      updated_at: '2024-01-01T00:00:00Z'
    };
    return mockDeal;
  },
  fetchDealById: async (dealId) => {
    const mockDeal = {
      id: dealId,
      deal_type: 'standard',
      status: 'draft',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };
    return mockDeal;
  },
  setDeal: (_deal) => {},
};

/**
 * Mock DealContext with a deal
 */
export const mockDealContextWithDeal = {
  ...mockDealContext,
  deal: {
    id: 'test-deal-123',
    deal_type: 'standard',
    status: 'draft',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {
      instagram: 'testuser',
      twitter: 'testuser',
      tiktok: 'testuser'
    },
    deal_terms: {
      title: 'Test Deal',
      description: 'Test deal description'
    },
    payor_info: {
      name: 'Test Payor',
      email: 'payor@example.com'
    }
  }
};

/**
 * Mock DealContext with loading state
 */
export const mockDealContextLoading = {
  ...mockDealContext,
  loading: true
};

/**
 * Mock DealContext with error state
 */
export const mockDealContextWithError = {
  ...mockDealContext,
  error: 'Test error message'
};

/**
 * Create a custom render function with mocked contexts
 * @param {React.ReactElement} component - Component to render
 * @param {Object} authContext - Mock auth context
 * @param {Object} dealContext - Mock deal context
 * @param {Object} options - Additional options for render
 * @returns {Object} Render result with testing utilities
 */
export const renderWithMockedContexts = (
  component,
  authContext = mockAuthContext,
  dealContext = mockDealContext,
  options = {}
) => {
  const MockedProviders = ({ children }) => {
    const MockAuthContext = React.createContext(authContext);
    const MockDealContext = React.createContext(dealContext);

    return (
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <MockAuthContext.Provider value={authContext}>
            <MockDealContext.Provider value={dealContext}>
              {children}
            </MockDealContext.Provider>
          </MockAuthContext.Provider>
        </BrowserRouter>
      </ChakraProvider>
    );
  };

  return render(component, { wrapper: MockedProviders, ...options });
};

/**
 * Test data utilities
 */
export const testData = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User'
    }
  },
  deal: {
    id: 'test-deal-123',
    deal_type: 'standard',
    status: 'draft',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {
      instagram: 'testuser',
      twitter: 'testuser',
      tiktok: 'testuser'
    },
    deal_terms: {
      title: 'Test Deal',
      description: 'Test deal description'
    },
    payor_info: {
      name: 'Test Payor',
      email: 'payor@example.com'
    }
  },
  socialMedia: {
    instagram: 'testuser',
    twitter: 'testuser',
    tiktok: 'testuser',
    youtube: 'testuser',
    linkedin: 'testuser'
  }
};

/**
 * Helper to create test props
 * @param {Object} overrides - Props to override defaults
 * @returns {Object} Test props object
 */
export const createTestProps = (overrides = {}) => ({
  ...testData,
  ...overrides
});

/**
 * Helper to wait for async operations
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export const waitForAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to mock console methods
 * @param {string} method - Console method to mock
 * @returns {jest.Mock} Mocked console method
 */
export const mockConsole = (method = 'log') => {
  const mock = jest.fn();
  const original = console[method];
  console[method] = mock;
  return { mock, restore: () => { console[method] = original; } };
};

export default {
  renderWithProviders,
  renderWithChakra,
  renderWithChakraAndRouter,
  renderWithMockedContexts,
  mockAuthContext,
  mockDealContext,
  mockDealContextWithDeal,
  mockDealContextLoading,
  mockDealContextWithError,
  testData,
  createTestProps,
  waitForAsync,
  mockConsole
};