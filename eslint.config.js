import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**", ".tmp/**", "**/next-env.d.ts", "apps/docs/src/generated/**", "playwright-report/**", "test-results/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["**/*.{js,mjs}", "**/*.config.{ts,js}", "scripts/**", "apps/docs/scripts/**", "packages/ui/scripts/**"],
    languageOptions: { globals: { ...globals.node } },
  },
);
