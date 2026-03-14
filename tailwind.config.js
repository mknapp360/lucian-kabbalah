/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, dark scholarly palette
        parchment: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#ebe0d0',
          300: '#dccbb0',
        },
        ink: {
          700: '#2c2520',
          800: '#1f1a16',
          900: '#141110',
          950: '#0a0908',
        },
        gold: {
          400: '#c9a84c',
          500: '#b8943f',
          600: '#a07d2f',
        },
        warmgray: {
          100: '#f0ece6',
          200: '#e0d9cf',
          300: '#c7bead',
          400: '#a89e8e',
          500: '#8a7f6f',
          600: '#6b6155',
          700: '#504840',
          800: '#383230',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Garamond', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading-1': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-2': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
        'heading-3': ['1.25rem', { lineHeight: '1.4' }],
        'body': ['1.0625rem', { lineHeight: '1.75' }],
        'small': ['0.875rem', { lineHeight: '1.6' }],
        'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        'prose': '38rem',
        'content': '48rem',
        'page': '72rem',
      },
      borderWidth: {
        '0.5': '0.5px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
