// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'risk-high': '#ef4444',
        'risk-medium': '#f97316',
        'risk-low': '#eab308',
        'risk-safe': '#22c55e',
      },
    },
  },
  plugins: [],
}

export default config