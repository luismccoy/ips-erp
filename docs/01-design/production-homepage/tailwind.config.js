/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#F0F7FF',
          100: '#E0EFFE',
          200: '#C7E0FD',
          300: '#A4CAFE',
          400: '#7DB3FC',
          500: '#4B9FDB',
          600: '#1565C0',
          700: '#0D47A1',
          800: '#0A3A7D',
          900: '#072E5F',
        },
        secondary: {
          50: '#E0F7F6',
          100: '#B3ECEB',
          200: '#80E0DD',
          300: '#4DD4CF',
          400: '#26C8C3',
          500: '#00897B',
          600: '#007A6B',
          700: '#006B5B',
          800: '#005A4B',
          900: '#004937',
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'float-delayed': 'float-delayed 5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
      },
    },
  },
  plugins: [],
}
