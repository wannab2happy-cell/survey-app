/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0099ff',
        secondary: '#f8fafc',
        accent: '#4f46e5',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        grayText: '#6b7280',
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.08)',
        card: '0 4px 12px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
