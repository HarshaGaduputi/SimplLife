/** @type {import('tailwindcss').Config} */

export default {
  darkMode: ["class", ".theme-dark"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    spacing: {
      0: "0px",
      0.5: "2px", // 2px
      1: "4px",   // 4px
      2: "8px",   // 8px
      3: "12px",  // 12px
      4: "16px",  // 16px
      6: "24px",  // 24px
      8: "32px",  // 32px
      12: "48px", // 48px
      16: "64px", // 64px
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "16px",
        md: "32px",
        lg: "48px",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      fontFamily: {
        display: ["-apple-system", "BlinkMacSystemFont", '"SF Pro Display"', "Inter", "system-ui", "sans-serif"],
        sans: ["-apple-system", "BlinkMacSystemFont", '"SF Pro Text"', "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
          foreground: "var(--color-secondary-foreground)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          hover: "var(--color-success-hover)",
          foreground: "var(--color-success-foreground)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          hover: "var(--color-warning-hover)",
          foreground: "var(--color-warning-foreground)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          hover: "var(--color-danger-hover)",
          foreground: "var(--color-danger-foreground)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          hover: "var(--color-info-hover)",
          foreground: "var(--color-info-foreground)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          hover: "var(--color-surface-hover)",
          selected: "var(--color-surface-selected)",
          alt: "var(--color-surface-alt)",
        },
        background: "var(--color-background)",
        border: {
          DEFAULT: "var(--color-border)",
          subtle: "var(--color-border-subtle)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          strong: "var(--color-text-strong)",
          muted: "var(--color-text-muted)",
        },
        accent: "var(--color-accent)",
        sidebar: {
          bg: "var(--sidebar-bg)",
          text: "var(--sidebar-text)",
          muted: "var(--sidebar-text-muted)",
          activeBg: "var(--sidebar-active-bg)",
          activeText: "var(--sidebar-active-text)",
        },
        navigation: {
          bg: "var(--nav-bg)",
          text: "var(--nav-text)",
          border: "var(--nav-border)",
        },
        focus: "var(--color-focus-ring)",
        disabled: {
          bg: "var(--color-disabled-bg)",
          text: "var(--color-disabled-text)",
        },
        hover: "var(--color-hover)",
        selected: "var(--color-selected)",
        // Keep completed for backwards compatibility
        completed: "var(--color-completed-bg)",
      },
      width: {
        auto: "auto",
        full: "100%",
        screen: "100vw",
        min: "min-content",
        max: "max-content",
        fit: "fit-content",
        // Extend default widths that are needed for layout elements
        5: "20px",
        9: "36px",
        10: "40px",
        14: "56px",
        20: "80px",
        64: "256px",
        72: "288px",
        80: "320px",
      },
      height: {
        auto: "auto",
        full: "100%",
        screen: "100vh",
        min: "min-content",
        max: "max-content",
        fit: "fit-content",
        // Extend default heights that are needed for layout elements
        5: "20px",
        9: "36px",
        10: "40px",
        14: "56px",
        16: "64px",
        20: "80px",
        64: "256px",
        72: "288px",
        80: "320px",
      },
      maxHeight: {
        screen: "100vh",
      },
      maxWidth: {
        md: "448px",
        lg: "512px",
        xl: "576px",
        "2xl": "672px",
        "3xl": "768px",
        "4xl": "896px",
        "5xl": "1024px",
        "6xl": "1152px",
        "7xl": "1280px",
        full: "100%",
      },
      boxShadow: {
        none: "none",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        ring: "0 0 0 2px var(--color-focus-ring)",
      },
      borderRadius: {
        btn: "var(--radius-btn)",
        input: "var(--radius-input)",
        card: "var(--radius-card)",
        dialog: "var(--radius-dialog)",
        avatar: "var(--radius-avatar)",
        badge: "var(--radius-badge)",
        table: "var(--radius-table)",
      },
      animation: {
        "fade-up": "fadeUp 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 260ms ease-out both",
        pop: "pop 220ms cubic-bezier(0.22, 1, 0.36, 1) both",
        spinner: "spin 800ms linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pop: {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      transitionProperty: {
        colors: "background-color, color, border-color, fill, stroke",
      },
    },
  },
  plugins: [],
};
