// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { FMVProvider } from "./context/FMVContext";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import theme from "./theme";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Router>
        <AuthProvider> {/* Add the AuthProvider here */}
          <FMVProvider>
            <App />
          </FMVProvider>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  </React.StrictMode>
);