import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';
import StatusBadge from './StatusBadge';

// We wrap the component in ChakraProvider because it uses Chakra UI features
const renderWithChakra = (component) => {
  return render(<ChakraProvider theme={theme}>{component}</ChakraProvider>);
};

describe('StatusBadge', () => {
  test('renders a "Signed" badge correctly', () => {
    renderWithChakra(<StatusBadge status="Signed" />);
    const badgeElement = screen.getByText('Signed');
    expect(badgeElement).toBeInTheDocument();
  });

  test('renders a "Pending" badge correctly', () => {
    renderWithChakra(<StatusBadge status="Pending" />);
    const badgeElement = screen.getByText('Pending');
    expect(badgeElement).toBeInTheDocument();
  });

  test('renders a "Negotiating" badge correctly', () => {
    renderWithChakra(<StatusBadge status="Negotiating" />);
    const badgeElement = screen.getByText('Negotiating');
    expect(badgeElement).toBeInTheDocument();
  });

  test('renders a "Completed" badge correctly', () => {
    renderWithChakra(<StatusBadge status="Completed" />);
    const badgeElement = screen.getByText('Completed');
    expect(badgeElement).toBeInTheDocument();
  });

    test('renders a "Cancelled" badge correctly', () => {
    renderWithChakra(<StatusBadge status="Cancelled" />);
    const badgeElement = screen.getByText('Cancelled');
    expect(badgeElement).toBeInTheDocument();
  });

  test('renders a default badge for an unknown status', () => {
    renderWithChakra(<StatusBadge status="Unknown Status" />);
    const badgeElement = screen.getByText('Unknown Status');
    expect(badgeElement).toBeInTheDocument();
  });
});