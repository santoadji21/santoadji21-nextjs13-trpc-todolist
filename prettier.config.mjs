
/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
    semi: true,
  tabWidth: 2,
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'none',
  jsxBracketSameLine: true,
  tailwindConfig: './tailwind.config.ts'
};

export default config;
