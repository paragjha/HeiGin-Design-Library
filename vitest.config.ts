import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const ui = resolve(import.meta.dirname, "packages/ui/src");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@heigin\/ui$/, replacement: `${ui}/index.ts` },
      { find: /^@heigin\/ui\/tokens$/, replacement: `${ui}/tokens.ts` },
    ],
  },
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
