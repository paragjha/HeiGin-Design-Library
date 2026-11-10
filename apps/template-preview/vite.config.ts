import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

const ui = resolve(import.meta.dirname, "../../packages/ui/src");
const template = resolve(import.meta.dirname, "../../templates/landing");

// Renders templates/landing exactly as a buyer's app would: Tailwind v4, the
// "@/" alias, and @heigin/ui. The build lands in the docs site's public folder
// so template pages can embed it at /preview/landing/.
export default defineConfig({
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
  server: { port: 5190, fs: { allow: ["../.."] } },
  build: {
    outDir: "../docs/public/preview/landing",
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
});
