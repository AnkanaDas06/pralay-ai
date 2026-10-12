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
        ops: {
          950: '#060b18',
          900: '#0b1328',
          850: '#101a35',
          800: '#182548',
          750: '#21335f',
          border: 'rgba(59, 130, 246, 0.22)',
          borderHover: 'rgba(59, 130, 246, 0.45)',
          greenBg: '#061715',
          greenBorder: 'rgba(16, 185, 129, 0.25)',
        },
        navy: {
          950: '#060b18',
          900: '#0b1328',
          850: '#101a35',
          800: '#182548',
          750: '#21335f',
          700: '#2d437a',
          600: '#3d5c9e',
          500: '#4e73c2',
        },
        hazard: {
          critical: '#ef4444',
          high: '#f97316',
          moderate: '#eab308',
          low: '#10b981',
          unknown: '#64748b',
        },
        telemetry: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -2px rgba(6, 182, 212, 0.35)',
        'glow-blue': '0 0 15px -2px rgba(59, 130, 246, 0.35)',
        'glow-red': '0 0 15px -2px rgba(239, 68, 68, 0.35)',
        'glow-orange': '0 0 15px -2px rgba(249, 115, 22, 0.35)',
        'glow-green': '0 0 15px -2px rgba(16, 185, 129, 0.35)',
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.55)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
