import '@testing-library/jest-dom';

// Mock window.matchMedia for Chakra UI
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console methods to prevent test output clutter
// const originalConsole = { ...console };
// global.console = {
//   ...originalConsole,
//   log: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(), // Keep error for debugging test failures
//   debug: jest.fn(),
// };

// Mock import.meta for Vite environment
if (!globalThis.import) {
  globalThis.import = {};
}
if (!globalThis.import.meta) {
  globalThis.import.meta = {};
}

// Set up import.meta.env with all necessary properties
globalThis.import.meta.env = {
  MODE: 'test',
  VITE_SUPABASE_URL: 'http://localhost:54321',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_API_URL: 'http://localhost:3000',
  VITE_APP_VERSION: '1.0.0',
  VITE_BUILD_TIME: new Date().toISOString(),
  ...globalThis.import.meta.env // allow override if needed
};

// Mock import.meta itself to handle direct access
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: globalThis.import.meta
  },
  writable: true
});