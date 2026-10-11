import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Bundlers drop module-level directives. This plugin records which source modules start with
 * "use client" and re-adds the directive to the matching output chunk (we preserve modules, so
 * there is one chunk per source file). Server-safe components stay directive-free.
 */
function preserveUseClient(): Plugin {
  const clientModules = new Set<string>();
  return {
    name: "heigin:preserve-use-client",
    enforce: "pre",
    transform(code, id) {
      if (/^\s*["']use client["'];?/.test(code)) clientModules.add(id.split("?")[0]!.replace(/\\/g, "/"));
      return null;
    },
    renderChunk(code, chunk) {
      const id = chunk.facadeModuleId?.replace(/\\/g, "/");
      if (id && clientModules.has(id)) return { code: `"use client";\n${code}`, map: null };
      return null;
    },
  };
}

const pkg = JSON.parse(readFileSync(resolve(import.meta.dirname, "package.json"), "utf8")) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const external = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})];

export default defineConfig({
  plugins: [react(), preserveUseClient()],
  css: {
    modules: {
      // Stable, readable class names: hg-button_primary_x1y2z
      generateScopedName: "hg-[name]_[local]_[hash:base64:5]",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
    cssCodeSplit: false,
    lib: {
      entry: { index: resolve(import.meta.dirname, "src/index.ts"), tokens: resolve(import.meta.dirname, "src/tokens.ts") },
      formats: ["es"],
      cssFileName: "styles",
    },
    rollupOptions: {
      external: (id) => external.some((dep) => id === dep || id.startsWith(`${dep}/`)) || id === "react/jsx-runtime",
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
    },
  },
});
