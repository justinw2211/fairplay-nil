// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
// *** BUG FIX: The FMVProvider import is now REMOVED. ***
import { AuthProvider } from "./context/AuthContext";
import { DealProvider } from "./context/DealContext";
import theme from "./theme";

// Initialize Sentry properly
import * as Sentry from "@sentry/react";
import { errorTrackingConfig } from "./config/environment";

Sentry.init({
  dsn: errorTrackingConfig.sentry.dsn,
  environment: errorTrackingConfig.sentry.environment,
  debug: errorTrackingConfig.sentry.debug,
  beforeSend(event) {
    // Filter out sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
    }
    return event;
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Router>
        <AuthProvider>
          <DealProvider>
            {/* *** BUG FIX: The FMVProvider component is now REMOVED. *** */}
            <App />
          </DealProvider>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  </React.StrictMode>
);