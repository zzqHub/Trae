/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 工业控制台暗黑配色
        ink: {
          950: '#070A0F',     // 最深背景
          900: '#0E1116',     // 主背景
          850: '#13171E',     // 卡片底
          800: '#181D26',     // 卡片边
          700: '#1F2630',     // hover
          600: '#2A3340',     // 边框
          500: '#3A4554',     // 文字次
          400: '#5A6573',     // 文字弱
          300: '#8B96A4',     // 文字淡
          200: '#B5BDC7',     // 文字主
          100: '#E5E8EC',     // 文字标题
        },
        cyan: { brand: '#22D3EE', deep: '#0E7490', dim: '#0B4A5C' },
        amber: { signal: '#F59E0B', deep: '#92400E' },
        green: { signal: '#10B981', deep: '#065F46' },
        red: { signal: '#EF4444', deep: '#7F1D1D' },
        violet: { signal: '#A855F7', deep: '#581C87' },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Sarasa Mono SC', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,0.4), 0 0 24px rgba(34,211,238,0.25)',
        'glow-amber': '0 0 0 1px rgba(245,158,11,0.4), 0 0 24px rgba(245,158,11,0.2)',
        'glow-red': '0 0 0 1px rgba(239,68,68,0.4), 0 0 24px rgba(239,68,68,0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'scan': 'scan 2.5s linear infinite',
        'blink': 'blink 1s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};
