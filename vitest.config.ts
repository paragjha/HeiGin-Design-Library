import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    modules: { generateScopedName: "[name]_[local]" },
  },
  test: {
    environment: "jsdom",
    globals: false,
    include: ["packages/**/src/**/*.test.{ts,tsx}", "tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup/vitest.setup.ts"],
    css: { modules: { classNameStrategy: "non-scoped" } },
    restoreMocks: true,
  },
});
