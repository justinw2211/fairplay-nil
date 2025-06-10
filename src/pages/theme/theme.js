import { extendTheme } from '@chakra-ui/react';

// 1. Define the color palette based on your selections
const colors = {
  brand: {
    primary: '#f4f4f4', // Main background - slightly off-white
    secondary: '#ffffff', // Card, Modal, and Paper background
    textPrimary: '#282f3d', // Main text color
    textSecondary: '#4e6a7b', // Lighter text, subheadings
    accent1: '#d0bdb5', // A warm, subtle accent
    accent2: '#d6dce4', // A cool, professional accent
  },
};

// 2. Define font styles
const fonts = {
  heading: "'Inter', sans-serif",
  body: "'Inter', sans-serif",
};

// 3. Define global styles
const styles = {
  global: {
    'html, body': {
      bg: 'brand.primary',
      color: 'brand.textPrimary',
    },
    a: {
      color: 'brand.textSecondary',
      _hover: {
        textDecoration: 'underline',
      },
    },
  },
};

// 4. Define component style overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'md',
    },
    variants: {
      solid: {
        bg: 'brand.textPrimary',
        color: 'brand.secondary',
        _hover: {
          bg: 'brand.textSecondary',
        },
      },
      outline: {
        borderColor: 'brand.accent2',
        color: 'brand.textSecondary',
        _hover: {
          bg: 'brand.accent2',
          color: 'brand.textPrimary',
        },
      },
    },
    defaultProps: {
      variant: 'solid',
    },
  },
  Heading: {
    baseStyle: {
      fontFamily: 'heading',
      color: 'brand.textPrimary',
      fontWeight: '800',
    },
  },
  Text: {
    baseStyle: {
      fontFamily: 'body',
      color: 'brand.textSecondary',
    },
  },
  Input: {
    defaultProps: {
      focusBorderColor: 'brand.accent1',
    },
  },
  NumberInput: {
     defaultProps: {
      focusBorderColor: 'brand.accent1',
    },
  },
  Select: {
     defaultProps: {
      focusBorderColor: 'brand.accent1',
    },
  },
};

// 5. Create the full theme object
export const theme = extendTheme({
  colors,
  fonts,
  styles,
  components,
});
