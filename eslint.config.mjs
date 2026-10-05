import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: ["dist/**", "build/**", "node_modules/**", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. Project Configuration & Overrides
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    plugins: { js },
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.node, // Keeps Playwright 'process' error fixed
      }
    },
  },
  pluginReact.configs.flat.recommended,
]);
