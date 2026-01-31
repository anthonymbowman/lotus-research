/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Lotus Brand Colors
        'lotus-grey': {
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
        'heading': ['"Neue Machina"', 'Inter', 'system-ui', 'sans-serif'],
        'body': ['Roboto', 'system-ui', 'sans-serif'],
      },
      lineHeight: {
        'tight': '130%',
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
