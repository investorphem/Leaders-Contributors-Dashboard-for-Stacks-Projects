import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/***.{j,ts,jsx,tsx,mdx}',
    './app/**/*.{jtmdx}',
  
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radil': 'aaliet(var(--tw-gradient-stops))',
        'gradient-conic'
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;