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
  // Chart-specific color palette derived from brand colors
  charts: {
    primary: "#d0bdb5",
    secondary: "#d6dce4", 
    tertiary: "#4e6a7b",
    background: "#ffffff",
    text: "#282f3d",
    grid: "#f4f4f4",
    // Color palette for chart series
    series: [
      "#d0bdb5", // brand.accentPrimary
      "#4e6a7b", // brand.textSecondary
      "#d6dce4", // brand.accentSecondary
      "#c9b2a9", // darker accent primary
      "#3a5566", // darker text secondary
      "#bcc5cc", // lighter accent secondary
    ]
  }
};

// Chart theme configuration for Recharts
export const chartTheme = {
  // Recharts default props
  recharts: {
    colors: colors.charts.series,
    backgroundColor: colors.charts.background,
    textColor: colors.charts.text,
    gridColor: colors.charts.grid,
    axisColor: colors.charts.tertiary,
  },
  // Nivo theme configuration
  nivo: {
    background: colors.charts.background,
    text: {
      fontSize: 12,
      fill: colors.charts.text,
    },
    axis: {
      domain: {
        line: {
          stroke: colors.charts.tertiary,
          strokeWidth: 1,
        },
      },
      legend: {
        text: {
          fontSize: 12,
          fill: colors.charts.text,
        },
      },
      ticks: {
        line: {
          stroke: colors.charts.tertiary,
          strokeWidth: 1,
        },
        text: {
          fontSize: 11,
          fill: colors.charts.text,
        },
      },
    },
    grid: {
      line: {
        stroke: colors.charts.grid,
        strokeWidth: 1,
      },
    },
    legends: {
      text: {
        fontSize: 12,
        fill: colors.charts.text,
      },
    },
    tooltip: {
      container: {
        background: colors.brand.background,
        color: colors.charts.text,
        fontSize: 12,
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    },
  }
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