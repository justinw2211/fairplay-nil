import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/test-utils';
import Universities from '../Universities';

describe('Universities page CTA and content', () => {
  test('hero CTA opens modal and banned strings are absent', () => {
    renderWithProviders(<Universities />);

    // No pricing/tiers strings
    expect(screen.queryByText(/Choose the Right Package/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/pricing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/trusted by/i)).not.toBeInTheDocument();

    // Hero CTA present and opens modal
    const cta = screen.getAllByRole('button', { name: /Schedule a Demo/i })[0];
    fireEvent.click(cta);
    expect(screen.getByText(/Schedule a Demo/i)).toBeInTheDocument();
  });
});


