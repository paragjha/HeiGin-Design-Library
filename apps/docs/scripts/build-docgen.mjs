// Extracts prop tables from the @heigin/ui source with react-docgen-typescript.
// Only props declared in HeiGin source files are listed; inherited DOM/Base UI props are
// summarised as "extends" so tables stay readable.
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import docgen from "react-docgen-typescript";

const root = resolve(import.meta.dirname, "../../..");
const componentsDir = join(root, "packages/ui/src/components");
const files = ["ui", "crm"].flatMap((dir) => {
  try {
    return readdirSync(join(componentsDir, dir))
      .filter((f) => f.endsWith(".tsx") && !f.includes(".test."))
      .map((f) => join(componentsDir, dir, f));
  } catch {
    return [];
  }
});

const parser = docgen.withCustomConfig(join(root, "packages/ui/tsconfig.json"), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: () => true,
});

const out = {};
for (const doc of parser.parse(files)) {
  const own = [];
  const inherited = new Set();
  for (const prop of Object.values(doc.props)) {
    const declaredIn = prop.declarations?.map((d) => d.fileName.replace(/\\/g, "/")) ?? [];
    const isOwn = declaredIn.some((f) => f.includes("/packages/ui/src/"));
    if (isOwn) {
      own.push({
        name: prop.name,
        type:
          prop.type.name === "enum" && Array.isArray(prop.type.value) && prop.type.value.length <= 8
            ? prop.type.value.map((v) => v.value).join(" | ")
            : (prop.type.raw ?? prop.type.name),
        required: prop.required,
        defaultValue: prop.defaultValue?.value ?? null,
        description: prop.description,
      });
    } else if (prop.parent?.name) {
      inherited.add(prop.parent.name);
    }
  }
  own.sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));
  out[doc.displayName] = { description: doc.description, props: own, extends: [...inherited].sort().slice(0, 6) };
}

mkdirSync(join(import.meta.dirname, "../src/generated"), { recursive: true });
writeFileSync(join(import.meta.dirname, "../src/generated/props.json"), `${JSON.stringify(out, null, 2)}\n`);
console.log(`docgen: ${Object.keys(out).length} components`);
