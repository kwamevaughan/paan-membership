/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Questrial", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        circularGradient: "circularGradient 6s linear infinite",
        swing: "swing 1s ease-in-out",
        "swing-infinite": "swing 2s ease-in-out infinite", // slowed down
      },
      keyframes: {
        circularGradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "50% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        swing: {
          "0%": { transform: "rotate(0deg)" },
          "10%": { transform: "rotate(15deg)" },
          "20%": { transform: "rotate(-10deg)" },
          "30%": { transform: "rotate(7deg)" },
          "40%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(3deg)" },
          "60%": { transform: "rotate(-2deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
