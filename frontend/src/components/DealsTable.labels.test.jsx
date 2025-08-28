import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import DealsTable from './DealsTable';

// Mock fetch globally
global.fetch = jest.fn();

// Mock supabase
jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({
        data: { session: { access_token: 'mock-token' } }
      }))
    }
  }
}));

// Test wrapper with ChakraProvider
const TestWrapper = ({ children }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

describe('DealsTable - Labels Functionality', () => {
  const mockSetDeals = jest.fn();
  const mockOnDealDeleted = jest.fn();
  const mockOnDealUpdated = jest.fn();

  const mockDeals = [
    {
      id: 1,
      brand_partner: 'Test Brand',
      fmv: 1000,
      status: 'draft',
      status_labels: ['Active', 'Cleared by NIL Go'],
      valuation_prediction: { estimated_fmv: 1000 },
      clearinghouse_result: null,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      brand_partner: 'Another Brand',
      fmv: 2000,
      status: 'active',
      status_labels: ['Completed'],
      valuation_prediction: null,
      clearinghouse_result: 'approved',
      created_at: '2024-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  it('computes system labels correctly', () => {
    render(
      <TestWrapper>
        <DealsTable 
          deals={mockDeals}
          setDeals={mockSetDeals}
          onDealDeleted={mockOnDealDeleted}
          onDealUpdated={mockOnDealUpdated}
        />
      </TestWrapper>
    );

    // First deal should show FMV Calculated (has valuation_prediction) and FMV Valuation Complete (fmv > 0)
    // Second deal should show Cleared by NIL Go (clearinghouse_result = 'approved') and FMV Valuation Complete
    expect(screen.getByText('FMV Calculated')).toBeInTheDocument();
    expect(screen.getAllByText('FMV Valuation Complete')).toHaveLength(2);
    expect(screen.getByText('Cleared by NIL Go')).toBeInTheDocument();
  });

  it('displays user labels correctly', () => {
    render(
      <TestWrapper>
        <DealsTable 
          deals={mockDeals}
          setDeals={mockSetDeals}
          onDealDeleted={mockOnDealDeleted}
          onDealUpdated={mockOnDealUpdated}
        />
      </TestWrapper>
    );

    // Should show user labels from status_labels
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Cleared by NIL Go')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('updates labels via API when changed', async () => {
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    render(
      <TestWrapper>
        <DealsTable 
          deals={mockDeals}
          setDeals={mockSetDeals}
          onDealDeleted={mockOnDealDeleted}
          onDealUpdated={mockOnDealUpdated}
        />
      </TestWrapper>
    );

    // Click on first deal's status menu
    const statusButtons = screen.getAllByRole('button', { name: /chevron-down/i });
    fireEvent.click(statusButtons[0]);

    // Add "Accepted" label
    const acceptedCheckbox = screen.getByLabelText(/Accepted/);
    fireEvent.click(acceptedCheckbox);

    // Should call API to update labels
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/deals/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ status_labels: ['Accepted', 'Cleared by NIL Go'] })
        })
      );
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock failed API response
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Server error' })
    });

    render(
      <TestWrapper>
        <DealsTable 
          deals={mockDeals}
          setDeals={mockSetDeals}
          onDealDeleted={mockOnDealDeleted}
          onDealUpdated={mockOnDealUpdated}
        />
      </TestWrapper>
    );

    // Click on first deal's status menu
    const statusButtons = screen.getAllByRole('button', { name: /chevron-down/i });
    fireEvent.click(statusButtons[0]);

    // Remove "Active" label
    const activeCheckbox = screen.getByLabelText(/Active/);
    fireEvent.click(activeCheckbox);

    // Should show error toast and rollback changes
    await waitFor(() => {
      expect(screen.getByText(/Failed to update deal labels/)).toBeInTheDocument();
    });
  });

  it('filters deals by selected label', () => {
    render(
      <TestWrapper>
        <DealsTable 
          deals={mockDeals}
          setDeals={mockSetDeals}
          onDealDeleted={mockOnDealDeleted}
          onDealUpdated={mockOnDealUpdated}
        />
      </TestWrapper>
    );

    // Select "Active" filter
    const filterSelect = screen.getByDisplayValue('All');
    fireEvent.change(filterSelect, { target: { value: 'Active' } });

    // Should only show first deal (has "Active" label)
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.queryByText('Another Brand')).not.toBeInTheDocument();
  });

  it('shows label counts in filter dropdown', () => {
    render(
      <TestWrapper>
        <DealsTable 
          deals={mockDeals}
          setDeals={mockSetDeals}
          onDealDeleted={mockOnDealDeleted}
          onDealUpdated={mockOnDealUpdated}
        />
      </TestWrapper>
    );

    // Check filter options show counts
    const filterSelect = screen.getByDisplayValue('All');
    
    // Each unique label should appear with count
    expect(screen.getByText('Active (1)')).toBeInTheDocument();
    expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    expect(screen.getByText('Cleared by NIL Go (2)')).toBeInTheDocument();
    expect(screen.getByText('FMV Calculated (1)')).toBeInTheDocument();
    expect(screen.getByText('FMV Valuation Complete (2)')).toBeInTheDocument();
  });

  it('clears filter when "All" is selected', () => {
    render(
      <TestWrapper>
        <DealsTable 
          deals={mockDeals}
          setDeals={mockSetDeals}
          onDealDeleted={mockOnDealDeleted}
          onDealUpdated={mockOnDealUpdated}
        />
      </TestWrapper>
    );

    // Apply filter first
    const filterSelect = screen.getByDisplayValue('All');
    fireEvent.change(filterSelect, { target: { value: 'Active' } });

    // Should show only one deal
    expect(screen.queryByText('Another Brand')).not.toBeInTheDocument();

    // Clear filter
    fireEvent.change(filterSelect, { target: { value: '' } });

    // Should show both deals again
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText('Another Brand')).toBeInTheDocument();
  });
});
