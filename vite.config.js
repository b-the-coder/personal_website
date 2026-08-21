import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      all: true,
      include: ["**/*.{js,jsx}"],
      exclude: [
        "**/*.test.*",
        "**/*.config.*",
        "dist/**",
        "script.jsx",
        "resumeAnno root component.jsx",
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
