import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

const ui = resolve(import.meta.dirname, "../../packages/ui/src");
const src = resolve(import.meta.dirname, "src");

// The docs render the library straight from source so previews always match the code panel.
export default defineConfig({
  // "/" so routes like /components/button resolve against the site root, not
  // against the current path. Pairs with the Vercel SPA rewrite in vercel.json.
  base: "/",
  // Tailwind only compiles src/kokonut/preview.css (the isolated Kokonut UI preview frame); the docs CSS is untouched.
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      // shadcn-style alias used by the vendored Kokonut UI components.
      { find: /^@\//, replacement: `${src}/` },
      { find: /^@heigin\/ui$/, replacement: `${ui}/index.ts` },
      { find: /^@heigin\/ui\/tokens$/, replacement: `${ui}/tokens.ts` },
      { find: /^@heigin\/ui\/base\.css$/, replacement: `${ui}/styles/base.css` },
      // Tokens only: component CSS modules are pulled in by the components themselves from source.
      { find: /^@heigin\/ui\/styles\.css$/, replacement: `${ui}/styles/index.css` },
    ],
  },
  css: {
    modules: { generateScopedName: "hg-[name]_[local]_[hash:base64:5]" },
  },
  server: { port: 5180, fs: { allow: ["../.."] } },
  preview: { port: 4173 },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
      },
    },
  },
});
