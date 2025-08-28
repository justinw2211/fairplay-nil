import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import StatusMenu from './StatusMenu';

// Test wrapper with ChakraProvider
const TestWrapper = ({ children }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

describe('StatusMenu', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with no labels', () => {
    render(
      <TestWrapper>
        <StatusMenu labels={[]} systemLabels={[]} onChange={mockOnChange} />
      </TestWrapper>
    );

    expect(screen.getByText('No labels')).toBeInTheDocument();
  });

  it('renders with user labels', () => {
    render(
      <TestWrapper>
        <StatusMenu 
          labels={['Active', 'In Negotiation']} 
          systemLabels={[]} 
          onChange={mockOnChange} 
        />
      </TestWrapper>
    );

    // Should show first 2 labels
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('In Negotiation')).toBeInTheDocument();
  });

  it('renders with system labels and shows auto indicator', () => {
    render(
      <TestWrapper>
        <StatusMenu 
          labels={['Active']} 
          systemLabels={['FMV Calculated']} 
          onChange={mockOnChange} 
        />
      </TestWrapper>
    );

    // Click to open menu
    fireEvent.click(screen.getByRole('button'));

    // Should show system label with auto indicator
    expect(screen.getByText('FMV Calculated')).toBeInTheDocument();
    expect(screen.getByText('Auto')).toBeInTheDocument();
  });

  it('shows truncation indicator when more than 2 labels', () => {
    render(
      <TestWrapper>
        <StatusMenu 
          labels={['Active', 'In Negotiation', 'Completed']} 
          systemLabels={[]} 
          onChange={mockOnChange} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('calls onChange when label is toggled and replaces mutually exclusive labels', () => {
    render(
      <TestWrapper>
        <StatusMenu 
          labels={['Active']} 
          systemLabels={[]} 
          onChange={mockOnChange} 
        />
      </TestWrapper>
    );

    // Click to open menu
    fireEvent.click(screen.getByRole('button'));

    // Click on "In Negotiation" checkbox - should replace "Active" since they're mutually exclusive
    const checkbox = screen.getByLabelText(/In Negotiation/);
    fireEvent.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith(['In Negotiation']);
  });

  it('removes label when already selected', () => {
    render(
      <TestWrapper>
        <StatusMenu 
          labels={['Active', 'Cleared by NIL Go']} 
          systemLabels={[]} 
          onChange={mockOnChange} 
        />
      </TestWrapper>
    );

    // Click to open menu
    fireEvent.click(screen.getByRole('button'));

    // Click on "Active" checkbox to remove it
    const checkbox = screen.getByLabelText(/Active/);
    fireEvent.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith(['Cleared by NIL Go']);
  });

  it('allows removal of system labels', () => {
    render(
      <TestWrapper>
        <StatusMenu 
          labels={[]} 
          systemLabels={['FMV Calculated']} 
          onChange={mockOnChange} 
        />
      </TestWrapper>
    );

    // Click to open menu
    fireEvent.click(screen.getByRole('button'));

    // Click on "FMV Calculated" checkbox to remove it
    const checkbox = screen.getByLabelText(/FMV Calculated/);
    fireEvent.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('shows all available user-selectable labels in menu', () => {
    render(
      <TestWrapper>
        <StatusMenu 
          labels={[]} 
          systemLabels={[]} 
          onChange={mockOnChange} 
        />
      </TestWrapper>
    );

    // Click to open menu
    fireEvent.click(screen.getByRole('button'));

    // Check all expected labels are present
    expect(screen.getByText('In Negotiation')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Cleared by NIL Go')).toBeInTheDocument();
  });

  it('shows correct checked state for labels', () => {
    render(
      <TestWrapper>
        <StatusMenu 
          labels={['Active']} 
          systemLabels={['FMV Calculated']} 
          onChange={mockOnChange} 
        />
      </TestWrapper>
    );

    // Click to open menu
    fireEvent.click(screen.getByRole('button'));

    // Active should be checked
    expect(screen.getByLabelText(/Active/).checked).toBe(true);
    
    // Others should not be checked
    expect(screen.getByLabelText(/In Negotiation/).checked).toBe(false);
    expect(screen.getByLabelText(/Accepted/).checked).toBe(false);
  });

  it('allows adding additional labels alongside status labels', () => {
    render(
      <TestWrapper>
        <StatusMenu 
          labels={['Active']} 
          systemLabels={[]} 
          onChange={mockOnChange} 
        />
      </TestWrapper>
    );

    // Click to open menu
    fireEvent.click(screen.getByRole('button'));

    // Click on "Cleared by NIL Go" checkbox - should add to existing "Active"
    const checkbox = screen.getByLabelText(/Cleared by NIL Go/);
    fireEvent.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith(['Active', 'Cleared by NIL Go']);
  });
});
