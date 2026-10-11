import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const ui = resolve(import.meta.dirname, "../../packages/ui/src");

// The docs render the library straight from source so previews always match the code panel.
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: [
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
  build: { outDir: "dist", chunkSizeWarningLimit: 1500 },
});
