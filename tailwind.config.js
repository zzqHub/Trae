/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        industrial: {
          50: "#f0f7ff",
          100: "#e0efff",
          200: "#b9ddff",
          300: "#7cc2ff",
          400: "#36a3ff",
          500: "#0c87f5",
          600: "#006ad2",
          700: "#0054aa",
          800: "#04488b",
          900: "#093d73",
          950: "#06274d",
        },
        dark: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae2",
          300: "#b0b9c7",
          400: "#8592a6",
          500: "#657489",
          600: "#505d6f",
          700: "#414c5b",
          800: "#38414d",
          900: "#1e222a",
          950: "#14171c",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#00b42a",
          600: "#16a34a",
          700: "#15803d",
        },
        warning: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#ff7d00",
          600: "#ea580c",
          700: "#c2410c",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#f53f3f",
          600: "#dc2626",
          700: "#b91c1c",
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "blink": "blink 1s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
      boxShadow: {
        "industrial": "0 4px 20px -2px rgba(12, 135, 245, 0.15)",
        "dark-lg": "0 10px 40px -10px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
