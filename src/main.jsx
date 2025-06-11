import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { FMVProvider } from "./context/FMVContext"; // Import the provider

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider>
      <FMVProvider> {/* Wrap the app with the provider */}
        <Router>
          <App />
        </Router>
      </FMVProvider>
    </ChakraProvider>
  </React.StrictMode>
);
