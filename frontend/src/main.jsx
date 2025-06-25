// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { FMVProvider } from "./context/FMVContext";
import { AuthProvider } from "./context/AuthContext";
// *** Add the import for our new DealProvider ***
import { DealProvider } from "./context/DealContext"; 
import theme from "./theme";

// Use ReactDOM.createRoot to render the application.
// This is the standard for React 18 and enables concurrent features.
ReactDOM.createRoot(document.getElementById("root")).render(
  // React.StrictMode is a tool for highlighting potential problems in an application.
  // It activates additional checks and warnings for its descendants.
  <React.StrictMode>
    {/* ChakraProvider sets up the theme and context for the Chakra UI library. */}
    <ChakraProvider theme={theme}>
      {/* Router provides routing capabilities to the application. */}
      <Router>
        {/* AuthProvider manages user authentication state throughout the application. */}
        <AuthProvider>
          {/* FMVProvider manages the state for the Fair Market Value form data. */}
          <FMVProvider>
            {/* *** Wrap the App with DealProvider so the wizard can access deal state *** */}
            <DealProvider>
              {/* App is the root component of the application. */}
              <App />
            </DealProvider>
          </FMVProvider>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  </React.StrictMode>
);