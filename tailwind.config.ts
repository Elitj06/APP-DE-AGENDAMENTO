import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      colors: {
        brand: { 50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12" },
        surface: { 50:"#fafafa",100:"#f5f5f5",200:"#e5e5e5",300:"#d4d4d4",700:"#404040",800:"#262626",900:"#171717",950:"#0a0a0a" },
      },
      keyframes: {
        "fade-up": { "0%": { opacity:"0", transform:"translateY(20px)" }, "100%": { opacity:"1", transform:"translateY(0)" } },
        "coin-float": { "0%,100%": { transform:"translateY(0) rotate(0deg)" }, "50%": { transform:"translateY(-10px) rotate(180deg)" } },
        "pulse-ring": { "0%": { transform:"scale(0.8)", opacity:"0.5" }, "100%": { transform:"scale(2)", opacity:"0" } },
        "slide-in": { "0%": { transform:"translateX(-100%)", opacity:"0" }, "100%": { transform:"translateX(0)", opacity:"1" } },
        "counter-up": { "0%": { transform:"translateY(100%)", opacity:"0" }, "100%": { transform:"translateY(0)", opacity:"1" } },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "coin-float": "coin-float 3s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.215,0.61,0.355,1) infinite",
        "slide-in": "slide-in 0.4s ease-out forwards",
        "counter-up": "counter-up 0.4s ease-out forwards",
      }
    },
  },
  plugins: [],
};
export default config;
