import React from 'react';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../../../theme';
import BlogArticle from '../BlogArticle';

const renderWithRoute = (initialEntry) => {
  return (
    <ChakraProvider theme={theme}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogArticle />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>
  );
};

test('renders article by slug', async () => {
  renderWithRoute('/blog/welcome-to-fairplay-nil');
  const title = await screen.findByText('Welcome to FairPlay NIL');
  expect(title).toBeInTheDocument();
});

test('shows not found for bad slug', async () => {
  renderWithRoute('/blog/does-not-exist');
  const notFound = await screen.findByText(/article not found/i);
  expect(notFound).toBeInTheDocument();
});


