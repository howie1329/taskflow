import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx,mdx}"],
  theme: { extend: {} },
  plugins: [typography],
};
