import tailwindcssAnimate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'
import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  safelist: [
    'lg:col-span-4',
    'lg:col-span-6',
    'lg:col-span-8',
    'lg:col-span-12',
    'border-border',
    'bg-card',
    'border-error',
    'bg-error/30',
    'border-success',
    'bg-success/30',
    'border-warning',
    'bg-warning/30',
  ],
  corePlugins: {
    container: false,
  },
  theme: {
    extend: {
      // --- THEME ENGINE MAPPING ---
      colors: {
        // Semantic variables linked to globals.css
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        secondary: 'hsl(var(--color-secondary) / <alpha-value>)',
        accent: 'hsl(var(--color-accent) / <alpha-value>)',

        main: 'hsl(var(--bg-main) / <alpha-value>)', // Maps bg-background to your main variable
        surface: 'hsl(var(--bg-surface) / <alpha-value>)', // Maps bg-surface

        // Shadcn/UI Standard Mappings (Required for UI components)
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        foreground: 'hsl(var(--text-body) / <alpha-value>)', // Maps text-foreground to your body text

        // Status colors
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',

        // Keep these if your UI components rely on specific hsl vars
        muted: {
          DEFAULT: 'hsl(var(--text-muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },

      // --- FONTS ---
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-geist-mono)'], // Keep for admin bar/code
        sans: ['var(--font-geist-sans)'],
      },

      // --- ULTRAWIDE SUPPORT ---
      screens: {
        '3xl': '1920px', // Adds the new breakpoint
      },

      // --- ANIMATIONS ---
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    typography,
    plugin(function ({ addVariant }) {
      // Add your custom theme variants here
      addVariant('light', '[data-theme="light"] &')
      addVariant('tan', '[data-theme="tan"] &')
      addVariant('interstellar', '[data-theme="interstellar"] &')
      // You can add more themes easily by duplicating the line above
    }),
  ],
}

export default config
