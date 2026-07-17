/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: { extend: {
    colors: {
      brand: { 50:'#F7FAF7', 100:'#E3F2E7', 600:'#128A4E', 700:'#0E6B3D', 900:'#0A4A2A' },
      lime: { DEFAULT:'#7AC143', dark:'#4E8F26', ink:'#0A3D22' },
      ink: { DEFAULT:'#1F2A24', soft:'#54685C' },
      line: '#DCE8DF',
    },
    fontFamily: { serif:['var(--font-lora)','Georgia','serif'], sans:['var(--font-bvp)','system-ui','sans-serif'] },
  } },
  plugins: [],
};
