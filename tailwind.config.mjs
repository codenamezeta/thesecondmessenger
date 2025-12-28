import tailwindcssAnimate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

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
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',

        background: 'var(--bg-main)', // Maps bg-background to your main variable
        surface: 'var(--bg-surface)', // Maps bg-surface

        // Shadcn/UI Standard Mappings (Required for UI components)
        border: 'hsla(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        foreground: 'var(--text-body)', // Maps text-foreground to your body text

        // Status colors
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',

        // Keep these if your UI components rely on specific hsl vars
        muted: {
          DEFAULT: 'var(--text-muted)',
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
  plugins: [tailwindcssAnimate, typography],
}

export default config
