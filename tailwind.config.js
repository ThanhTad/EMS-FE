// tailwind.config.js

import tailwindcssAnimate from "tailwindcss-animate";

module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}", // nếu bạn để mã nguồn ở src/
  ],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        "shake-short": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-3px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(3px)" },
        },
      },
      animation: {
        "shake-short": "shake-short 0.4s ease-in-out",
      },
    },
  },

  plugins: [
    tailwindcssAnimate, // nếu dùng shadcn/ui animations
  ],
};
