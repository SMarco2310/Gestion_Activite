import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#185FA5',
          light: '#E6F1FB',
          dark: '#0C447C',
        },
        conflict: { DEFAULT: '#E24B4A', light: '#FCEBEB' },
        success: { DEFAULT: '#27500A', light: '#EAF3DE' },
        warning: { DEFAULT: '#BA7517', light: '#FAEEDA' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
