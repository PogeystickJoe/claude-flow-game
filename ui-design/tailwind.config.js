/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          50: '#f0fdff',
          100: '#ccf7fe',
          200: '#99edfd',
          300: '#66e2fc',
          400: '#06d6f9',
          500: '#00bcd4',
          600: '#0097a7',
          700: '#00796b',
          800: '#004d40',
          900: '#00251a',
        },
        neon: {
          green: '#39ff14',
          blue: '#1b03a3',
          pink: '#ff0080',
          purple: '#8a2be2',
          orange: '#ff4500',
          yellow: '#ffff00',
        },
        matrix: {
          black: '#000000',
          dark: '#001100',
          green: '#00ff41',
          brightGreen: '#00ff00',
        }
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'matrix-rain': 'matrix-rain 3s linear infinite',
        'cyber-scan': 'cyber-scan 4s linear infinite',
        'neural-pulse': 'neural-pulse 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glitch': 'glitch 2s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { 
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
            textShadow: '0 0 5px currentColor'
          },
          '100%': { 
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
            textShadow: '0 0 10px currentColor'
          }
        },
        'matrix-rain': {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        'cyber-scan': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' }
        },
        'neural-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' }
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
        'cyber': ['Orbitron', 'Exo 2', 'sans-serif'],
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0,255,65,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.1) 1px, transparent 1px)',
        'neural-net': 'radial-gradient(circle at 20% 50%, rgba(0,188,212,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(57,255,20,0.3) 0%, transparent 50%)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}