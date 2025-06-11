// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { FMVProvider } from "./context/FMVContext";
import theme from "./theme"; // Import the custom theme

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}> {/* Add the theme to the provider */}
      <FMVProvider>
        <Router>
          <App />
        </Router>
      </FMVProvider>
    </ChakraProvider>
  </React.StrictMode>
);