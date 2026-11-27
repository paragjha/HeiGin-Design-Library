import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

const ui = resolve(import.meta.dirname, "../../packages/ui/src");
const src = resolve(import.meta.dirname, "src");

// The vendored Kokonut UI preview frame, built on its own so its module graph can never entangle
// with the docs SPA. (Built together, rolldown hoisted the docs `main` entry into a chunk the
// frame imported, so the frame booted the whole docs app and showed "Page not found".) It writes
// kokonut-preview.html + kokonut-assets/ into the docs dist after the main build, keeping the
// /kokonut-preview.html URL the registry points iframes at.
export default defineConfig({
  base: "/",
  publicDir: false,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${src}/` },
      { find: /^@heigin\/ui$/, replacement: `${ui}/index.ts` },
      { find: /^@heigin\/ui\/tokens$/, replacement: `${ui}/tokens.ts` },
      { find: /^@heigin\/ui\/base\.css$/, replacement: `${ui}/styles/base.css` },
      { find: /^@heigin\/ui\/styles\.css$/, replacement: `${ui}/styles/index.css` },
    ],
  },
  css: { modules: { generateScopedName: "hg-[name]_[local]_[hash:base64:5]" } },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    assetsDir: "kokonut-assets",
    chunkSizeWarningLimit: 1500,
    rolldownOptions: { input: { kokonut: resolve(import.meta.dirname, "kokonut-preview.html") } },
  },
});
