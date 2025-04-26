// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include all files
  ],
  theme: {
    extend: {
      backgroundImage: {
        "notebook-paper": "linear-gradient(#ccc 1px, transparent 1px)",
      },
      backgroundSize: {
        "notebook-paper": "100% 30px",
      },
    },
  },
  plugins: [],
};
