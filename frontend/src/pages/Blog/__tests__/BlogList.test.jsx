import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithChakraAndRouter } from '../../../utils/test-utils';
import BlogList from '../BlogList';

test('renders blog list and navigates to article', async () => {
  renderWithChakraAndRouter(<BlogList />);

  // Title from initial data source
  const title = await screen.findByText('Welcome to FairPlay NIL');
  expect(title).toBeInTheDocument();

  const readMore = screen.getByRole('link', { name: /read more/i });
  await userEvent.click(readMore);

  // After navigation, article title should be visible
  const articleTitle = await screen.findByText('Welcome to FairPlay NIL');
  expect(articleTitle).toBeInTheDocument();
});


