/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    // Rating colors - base classes
    'text-rating-a-plus', 'text-rating-a', 'text-rating-b-plus', 'text-rating-b',
    'text-rating-c-plus', 'text-rating-c', 'text-rating-d',
    'bg-rating-a-plus', 'bg-rating-a', 'bg-rating-b-plus', 'bg-rating-b',
    'bg-rating-c-plus', 'bg-rating-c', 'bg-rating-d',
    'border-rating-a-plus', 'border-rating-a', 'border-rating-b-plus', 'border-rating-b',
    'border-rating-c-plus', 'border-rating-c', 'border-rating-d',
    // Rating colors - with opacity modifiers used in the codebase
    'bg-rating-a/15', 'bg-rating-a/20', 'bg-rating-a/60',
    'bg-rating-a-plus/15', 'bg-rating-a-plus/20',
    'bg-rating-b/10', 'bg-rating-b/20',
    'bg-rating-c-plus/15', 'bg-rating-c-plus/20',
    'border-rating-b/30', 'border-rating-b/50',
  ],
  theme: {
    extend: {
      colors: {
        // Constraint Colors (for constraint visualization system)
        'constraint': {
          active: '#f59e0b',    // amber-500 - constraint is binding
          near: '#fcd34d',      // amber-300 - approaching constraint
          border: '#d97706',    // amber-600 - dashed borders
          bg: 'rgba(245, 158, 11, 0.1)',  // amber with low opacity for backgrounds
          'bg-hover': 'rgba(245, 158, 11, 0.2)',
        },
        // Credit Rating Colors (risk spectrum: safest → riskiest)
        'rating': {
          'a-plus': '#2FFAE2',  // A+ - safest (teal)
          'a': '#6BF4A0',       // A (green)
          'b-plus': '#B0ED83',  // B+ (lime)
          'b': '#EBE283',       // B (yellow)
          'c-plus': '#FFA5CD',  // C+ (pink)
          'c': '#E764FA',       // C (magenta)
          'd': '#FE3E38',       // D - default/riskiest (red)
        },
        // Lotus Brand Colors
        'lotus-grey': {
          950: '#08060C', // darker than 900 for container fills
          900: '#0D0A14', // --dark-grey (main background)
          800: '#191621', // --dark-grey-2
          700: '#27232F', // --dark-grey-3
          600: '#352F40',
          500: '#454052',
          400: '#736D7F', // --grey-500 (muted text)
          300: '#D4D0DD', // --grey-300 (body text)
          200: '#E8E5EE',
          100: '#FBFAFC', // --grey-100 (headings)
          50: '#FEFEFE',
        },
        'lotus-purple': {
          950: '#1A0833',
          900: '#280B55', // --purple-dark
          800: '#3F1C85', // --purple-bg
          700: '#5A2DB0',
          600: '#7549D9',
          500: '#8E62FF', // --purple-primary
          400: '#A882FF',
          300: '#C4B2FF', // --purple-light
          200: '#DDD2FF',
          100: '#F0EBFF',
          50: '#F8F6FF',
        },
        // Legacy lotus color (for backwards compatibility during transition)
        lotus: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        'heading': ['"Neue Machina"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        'body': ['"Neue Montreal"', 'Inter', 'system-ui', 'sans-serif'],
        'mono': ['"Roboto Mono"', 'ui-monospace', 'monospace'],
      },
      lineHeight: {
        'tight': '1.3',
        'normal': '1.6',
        'relaxed': '1.7',
      },
      fontSize: {
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
      },
      backgroundImage: {
        'lotus-gradient': 'linear-gradient(135deg, #0D0A14 0%, #280B55 100%)',
        'lotus-gradient-subtle': 'linear-gradient(180deg, #191621 0%, #0D0A14 100%)',
      },
      boxShadow: {
        'lotus': '0 4px 20px rgba(142, 98, 255, 0.15)',
        'lotus-lg': '0 8px 40px rgba(142, 98, 255, 0.2)',
      },
    },
  },
  plugins: [],
};
