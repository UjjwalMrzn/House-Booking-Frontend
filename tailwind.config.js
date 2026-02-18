/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#059669', // Darker, premium Emerald
          dark: '#111827',  // Deep charcoal
          light: '#f9fafb', // Soft gray
        }
      },
      backgroundImage: {
        'squad-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 100%)', // The "Squad" depth
      },
      boxShadow: {
        'float': '0 20px 40px -5px rgba(0, 0, 0, 0.05)', // Smooth card float
        'input': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Professional standard
      }
    },
  },
  plugins: [],
}