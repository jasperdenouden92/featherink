import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Featherink Design System Colors
        'magical-blue': '#2800CA',
        'lavender': '#CCEAF9',
        'paper': '#F9F9FC',
        'ink-black': '#2C2C30',
        'blood-red': '#D72F00',
        'forest-green': '#009544',
        'ash-grey': '#303449',
        'books-grey': '#606060',
        'pencils-grey': '#A0A0A1',
        'iron-grey': '#E0E0E2',
        'marble-grey': '#EEEEF0',
      },
      fontFamily: {
        'yantramanav': ['Yantramanav', 'sans-serif'],
        'vollkorn': ['Vollkorn', 'serif'],
      },
      fontSize: {
        'heading-1': ['40px', { lineHeight: '48px' }],
        'heading-2': ['32px', { lineHeight: '40px' }],
        'heading-3': ['24px', { lineHeight: '32px' }],
        'heading-4': ['20px', { lineHeight: '28px' }],
        'subtitle-1': ['24px', { lineHeight: '32px' }],
        'subtitle-2': ['18px', { lineHeight: '25px' }],
        'subtitle-3': ['18px', { lineHeight: '26px' }],
        'paragraph-1': ['18px', { lineHeight: '26px' }],
        'paragraph-2': ['18px', { lineHeight: '20px' }],
        'caption': ['14px', { lineHeight: '22px', letterSpacing: '1px' }],
        'micro': ['12px', { lineHeight: '16px' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        'desktop': '1152px',
        'tablet': '704px',
        'mobile': '320px',
      },
      gridTemplateColumns: {
        'desktop': 'repeat(12, 64px)',
        'tablet': 'repeat(8, 56px)',
        'mobile': 'repeat(4, 48px)',
      },
      gap: {
        'desktop': '32px',
        'tablet': '32px',
        'mobile': '32px',
      },
    },
  },
  plugins: [],
};

export default config;
