/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        sidebar: {
          bg: '#063B2C',
          hover: '#094E3B',
          active: '#059669',
          border: '#0A523E',
          text: '#D1FAE5',
          muted: '#80CBB4',
        },
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E5E7EB',
          darkBg: '#0F172A',
          darkCard: '#1E293B',
          darkBorder: '#334155',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'card': '0 0 0 1px rgba(0, 0, 0, 0.03), 0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        'dropdown': '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};
