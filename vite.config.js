import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    exclude: ["src/tests/e2e-tests/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      all: true,
      include: ["**/*.{js,jsx}"],
      exclude: [
        "**/*.test.*",
        "**/*.config.*",
        "dist/**",
        "app.jsx",
        "main.jsx",
        "layout.jsx",
        "resume-anno.jsx",
        "server.js"
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
