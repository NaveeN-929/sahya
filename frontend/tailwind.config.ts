import type { Config } from "tailwindcss";

/**
 * Digital Sanctuary — Tailwind CSS v4 configuration
 * All color/radius/shadow/motion values resolve to CSS variables defined in tokens/globals.css,
 * so theming (light/dark/high-contrast) requires zero class changes — only a root attribute swap.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "var(--color-primary-50)", 100: "var(--color-primary-100)", 200: "var(--color-primary-200)",
          300: "var(--color-primary-300)", 400: "var(--color-primary-400)", 500: "var(--color-primary-500)",
          600: "var(--color-primary-600)", 700: "var(--color-primary-700)", 800: "var(--color-primary-800)",
          900: "var(--color-primary-900)", 950: "var(--color-primary-950)",
          DEFAULT: "var(--color-primary-500)",
        },
        secondary: {
          50: "var(--color-secondary-50)", 100: "var(--color-secondary-100)", 300: "var(--color-secondary-300)",
          500: "var(--color-secondary-500)", 600: "var(--color-secondary-600)", 700: "var(--color-secondary-700)",
          DEFAULT: "var(--color-secondary-500)",
        },
        amber: {
          50: "var(--color-amber-50)", 100: "var(--color-amber-100)", 300: "var(--color-amber-300)",
          500: "var(--color-amber-500)", 600: "var(--color-amber-600)",
        },
        neutral: {
          0: "var(--color-neutral-0)", 25: "var(--color-neutral-25)", 50: "var(--color-neutral-50)",
          100: "var(--color-neutral-100)", 200: "var(--color-neutral-200)", 300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)", 500: "var(--color-neutral-500)", 600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)", 800: "var(--color-neutral-800)", 900: "var(--color-neutral-900)",
          950: "var(--color-neutral-950)",
        },
        success: { bg: "var(--color-success-bg)", border: "var(--color-success-border)", fg: "var(--color-success-fg)", solid: "var(--color-success-solid)" },
        warning: { bg: "var(--color-warning-bg)", border: "var(--color-warning-border)", fg: "var(--color-warning-fg)", solid: "var(--color-warning-solid)" },
        info:    { bg: "var(--color-info-bg)",    border: "var(--color-info-border)",    fg: "var(--color-info-fg)",    solid: "var(--color-info-solid)" },
        error:   { bg: "var(--color-error-bg)",   border: "var(--color-error-border)",   fg: "var(--color-error-fg)",   solid: "var(--color-error-solid)" },
        emergency: { DEFAULT: "var(--color-emergency-solid)", hover: "var(--color-emergency-solid-hover)" },

        // semantic surface/text aliases — prefer these over raw neutral/primary scales in components
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        "surface-raised": "var(--bg-surface-raised)",
        muted: "var(--bg-muted)",
        inverse: "var(--bg-inverse)",
        border: { DEFAULT: "var(--border-default)", strong: "var(--border-strong)", focus: "var(--border-focus)" },
        ink: { DEFAULT: "var(--text-primary)", secondary: "var(--text-secondary)", muted: "var(--text-muted)", inverse: "var(--text-inverse)", link: "var(--text-link)", brand: "var(--text-brand)" },
      },
      fontFamily: {
        body: ["var(--font-body)"],
        heading: ["var(--font-heading)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        input: "var(--radius-input)",
        button: "var(--radius-button)",
        card: "var(--radius-card)",
        "card-lg": "var(--radius-card-lg)",
      },
      boxShadow: {
        1: "var(--shadow-1)", 2: "var(--shadow-2)", 3: "var(--shadow-3)", 4: "var(--shadow-4)",
        "focus-ring": "var(--shadow-focus-ring)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)", base: "var(--duration-base)", slow: "var(--duration-slow)", deliberate: "var(--duration-deliberate)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)", decelerate: "var(--ease-decelerate)", spring: "var(--ease-spring)",
      },
      spacing: {
        // explicit aliases for the brief's named scale, on top of Tailwind's default scale
        18: "4.5rem",
      },
      screens: {
        // mobile-first: base = 4-col, tablet = 8-col, desktop = 12-col grid (see docs/DESIGN-SYSTEM.md)
        sm: "640px",
        tablet: "768px",
        lg: "1024px",
        desktop: "1280px",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.97)" }, to: { opacity: "1", transform: "scale(1)" } },
      },
      animation: {
        "fade-in": "fade-in var(--duration-base) var(--ease-decelerate) both",
        "slide-up": "slide-up var(--duration-slow) var(--ease-decelerate) both",
        "scale-in": "scale-in var(--duration-base) var(--ease-spring) both",
      },
    },
  },
  plugins: [],
};

export default config;
