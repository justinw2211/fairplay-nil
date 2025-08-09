import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithChakra } from '../../utils/test-utils';
import UniversitiesDemoModal from '../UniversitiesDemoModal';

describe('UniversitiesDemoModal', () => {
  test('renders required fields and validates', async () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();
    renderWithChakra(
      <UniversitiesDemoModal isOpen onClose={onClose} onSubmit={onSubmit} />
    );

    // Required fields present
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/University/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();

    // Try submit empty -> validation errors
    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));

    await waitFor(() => {
      expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Message is required/i)).toBeInTheDocument();
    });
  });
});


