/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        fg: 'var(--fg)',
        muted: 'var(--fg-muted)',
        subtle: 'var(--fg-subtle)',
        link: 'var(--link)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          fg: 'var(--primary-fg)',
          soft: 'var(--primary-soft)',
        },
      },
      fontFamily: {
        sans: ['"Public Sans"', 'system-ui', '"Segoe UI"', 'sans-serif'],
      },
      borderColor: { DEFAULT: 'var(--border)' },
      ringColor: { DEFAULT: 'var(--primary)' },
    },
  },
  plugins: [],
};
