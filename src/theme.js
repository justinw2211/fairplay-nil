// src/theme.js
import { extendTheme } from "@chakra-ui/react";

const colors = {
  brand: {
    background: "#ffffff",
    backgroundLight: "#f4f4f4",
    textPrimary: "#282f3d",
    textSecondary: "#4e6a7b",
    accentPrimary: "#d0bdb5",
    accentSecondary: "#d6dce4",
  },
};

const fonts = {
  heading: "'Inter', sans-serif",
  body: "'Inter', sans-serif",
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: "bold",
      borderRadius: "8px",
    },
    variants: {
      solid: {
        bg: "brand.accentPrimary",
        color: "brand.background",
        _hover: {
          bg: "#c9b2a9",
        },
      },
      outline: {
        borderColor: "brand.accentSecondary",
        color: "brand.textSecondary",
        _hover: {
          bg: "brand.backgroundLight",
        },
      },
      ghost: {
        color: "brand.textSecondary",
        _hover: {
          bg: "brand.backgroundLight",
        },
      },
      link: {
        color: "brand.accentPrimary",
      },
    },
    defaultProps: {
      variant: "solid",
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          bg: "brand.background",
          borderColor: "brand.accentSecondary",
          _hover: {
            borderColor: "brand.accentPrimary",
          },
          _focus: {
            borderColor: "brand.accentPrimary",
            boxShadow: "0 0 0 1px #d0bdb5",
          },
        },
      },
    },
  },
  NumberInput: {
    variants: {
      outline: {
        field: {
          bg: "brand.background",
          borderColor: "brand.accentSecondary",
          _hover: {
            borderColor: "brand.accentPrimary",
          },
          _focus: {
            borderColor: "brand.accentPrimary",
            boxShadow: "0 0 0 1px #d0bdb5",
          },
        },
      },
    },
  },
   Select: {
    variants: {
      outline: {
        field: {
          bg: "brand.background",
          borderColor: "brand.accentSecondary",
           _hover: {
            borderColor: "brand.accentPrimary",
          },
          _focus: {
            borderColor: "brand.accentPrimary",
            boxShadow: "0 0 0 1px #d0bdb5",
          },
        },
      },
    },
  },
  Progress: {
    baseStyle: {
      track: {
        bg: "brand.accentSecondary",
      },
      filledTrack: {
        bg: "brand.accentPrimary",
      },
    },
  },
};

const styles = {
  global: {
    "html, body": {
      color: "brand.textPrimary",
      bg: "brand.backgroundLight",
    },
  },
};

const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
});

export default theme;