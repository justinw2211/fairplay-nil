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

// Import environment configuration
import { errorTrackingConfig, isErrorTrackingEnabled } from "./config/environment";

// Initialize Sentry only if enabled and DSN is available
if (isErrorTrackingEnabled() && errorTrackingConfig.sentry.dsn) {
  try {
    // Dynamic import to avoid issues if Sentry fails to load
    import("@sentry/react").then((Sentry) => {
      import("@sentry/tracing").then(({ BrowserTracing }) => {
        Sentry.init({
          dsn: errorTrackingConfig.sentry.dsn,
          environment: errorTrackingConfig.sentry.environment,
          debug: errorTrackingConfig.sentry.debug,
          tracesSampleRate: errorTrackingConfig.sentry.tracesSampleRate,
          replaysSessionSampleRate: errorTrackingConfig.sentry.replaysSessionSampleRate,
          replaysOnErrorSampleRate: errorTrackingConfig.sentry.replaysOnErrorSampleRate,
          integrations: [
            new BrowserTracing(),
          ],
          defaultTags: errorTrackingConfig.sentry.defaultTags,
        });
      }).catch((error) => {
        console.warn("Failed to initialize Sentry tracing:", error);
      });
    }).catch((error) => {
      console.warn("Failed to initialize Sentry:", error);
    });
  } catch (error) {
    console.warn("Sentry initialization failed:", error);
  }
}

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