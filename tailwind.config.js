/** @type {import('tailwindcss').Config} */

export default {
  darkMode: ["class", ".theme-dark"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        md: "2rem",
        lg: "3rem",
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
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        page: "var(--color-page)",
        panel: "var(--color-panel)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        "text-strong": "var(--color-text-strong)",
        "text-muted": "var(--color-text-muted)",
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-foreground": "var(--color-primary-foreground)",
        secondary: "var(--color-secondary)",
        "secondary-foreground": "var(--color-secondary-foreground)",
        accent: "var(--color-accent)",
        border: "var(--color-border)",
        "border-subtle": "var(--color-border-subtle)",
        "surface-alt": "var(--color-surface-alt)",
        completed: "var(--color-completed-bg)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(22,88,123,0.12)",
        hover: "0 4px 8px rgba(0,0,0,0.06), 0 20px 40px -20px rgba(22,88,123,0.25)",
        ring: "0 0 0 2px var(--color-primary)",
      },
      borderRadius: {
        xl2: "14px",
        xl3: "18px",
      },
      animation: {
        "fade-up": "fadeUp 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 260ms ease-out both",
        pop: "pop 220ms cubic-bezier(0.22, 1, 0.36, 1) both",
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
      },
      transitionProperty: {
        colors: "background-color, color, border-color, fill, stroke",
      },
    },
  },
  plugins: [],
};
