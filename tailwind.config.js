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
      // tuỳ chỉnh theme nếu muốn
    },
  },

  plugins: [
    tailwindcssAnimate, // nếu dùng shadcn/ui animations
  ],
};
