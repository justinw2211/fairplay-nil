import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './pages/App';
import { FMVProvider } from './context/FMVContext';
import { theme } from './theme/theme'; // Import our new theme

// Create a client for react-query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <FMVProvider>
          <Router>
            <App />
          </Router>
        </FMVProvider>
      </ChakraProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
