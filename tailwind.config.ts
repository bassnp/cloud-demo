import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS Configuration - Cloud Demo Design System
 * 
 * Extends the default theme with:
 * - Brand color scales (Pacific Blue, Lime Moss, Porcelain, Oxford Navy, Tangerine)
 * - Custom glow shadows for interactive elements
 * - Smooth animations for micro-interactions
 * - Shadcn UI integration
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    /** Container configuration - centered with responsive padding */
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        /* CSS Variable-based colors (Shadcn UI) */
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        
        /* Brand Color Scales */
        'pacific-blue': {
          50: '#e8fbfd',
          100: '#d0f7fb',
          200: '#a1f0f7',
          300: '#72e8f3',
          400: '#43e0ef',
          500: '#14d9eb',
          600: '#10adbc',
          700: '#0c828d',
          800: '#08575e',
          900: '#042b2f',
          950: '#031e21',
        },
        'lime-moss': {
          50: '#f7ffe5',
          100: '#efffcc',
          200: '#dfff99',
          300: '#cfff66',
          400: '#beff33',
          500: '#aeff00',
          600: '#8bcc00',
          700: '#699900',
          800: '#466600',
          900: '#233300',
          950: '#182400',
        },
        'porcelain': {
          50: '#f6f4ee',
          100: '#eee8dd',
          200: '#ddd2bb',
          300: '#ccbb99',
          400: '#bba477',
          500: '#aa8e55',
          600: '#887144',
          700: '#665533',
          800: '#443922',
          900: '#221c11',
          950: '#18140c',
        },
        'oxford-navy': {
          50: '#e9f1fc',
          100: '#d3e3f8',
          200: '#a7c7f1',
          300: '#7babea',
          400: '#4f8fe3',
          500: '#2273dd',
          600: '#1c5cb0',
          700: '#154584',
          800: '#0e2e58',
          900: '#07172c',
          950: '#05101f',
        },
        'tangerine': {
          50: '#feefe7',
          100: '#fcdfcf',
          200: '#f9be9f',
          300: '#f79e6e',
          400: '#f47e3e',
          500: '#f15d0e',
          600: '#c14b0b',
          700: '#913808',
          800: '#602506',
          900: '#301303',
          950: '#220d02',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px -3px var(--tw-shadow-color)',
        'glow': '0 0 20px -5px var(--tw-shadow-color)',
        'glow-lg': '0 0 30px -5px var(--tw-shadow-color)',
        'inner-glow': 'inset 0 0 20px -10px var(--tw-shadow-color)',
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
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px var(--tw-shadow-color)' },
          '50%': { boxShadow: '0 0 20px var(--tw-shadow-color)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
