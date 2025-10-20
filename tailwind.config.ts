import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  safelist: [
    // 상태 색상
    'bg-red-100', 'text-red-800', 'border-red-200',
    'bg-orange-100', 'text-orange-800', 'border-orange-200',
    'bg-yellow-100', 'text-yellow-800', 'border-yellow-200',
    'bg-gray-100', 'text-gray-800', 'border-gray-200',
    // 연료 분류 색상
    'bg-gray-900', 'text-white', 'border-gray-900',  // 석탄
    'bg-red-600', 'border-red-600',                  // LNG
    'bg-amber-600', 'border-amber-600',              // 경유
    'bg-orange-600', 'border-orange-600',            // 기타화력
    'bg-purple-600', 'border-purple-600',            // 원자력
    'bg-pink-600', 'border-pink-600',                // 열병합
    'bg-gray-500', 'border-gray-500',                // 기타
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
