import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

const ui = resolve(import.meta.dirname, "../../packages/ui/src");
const template = resolve(import.meta.dirname, "../../templates/motion");

// Renders templates/motion the way a buyer's app would: Tailwind v4, the "@/" alias and
// @heigin/ui. Builds into the docs site so template pages can embed it at /preview/motion/.
export default defineConfig({
  root: resolve(import.meta.dirname, "motion"),
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${template}/` },
      { find: /^@heigin\/ui$/, replacement: `${ui}/index.ts` },
      { find: /^@heigin\/ui\/styles\.css$/, replacement: `${ui}/styles/index.css` },
      { find: /^@heigin\/ui\/tailwind\.css$/, replacement: `${ui}/styles/tailwind.css` },
    ],
  },
  server: { port: 5192, fs: { allow: ["../.."] } },
  build: {
    outDir: resolve(import.meta.dirname, "../docs/public/preview/motion"),
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
});
