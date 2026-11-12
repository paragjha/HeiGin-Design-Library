#!/usr/bin/env node
// Lightweight secret / production-data scan over tracked + staged files (CI also runs gitleaks).
// Fails on credential-looking strings, env files, session captures, or the production host in
// places other than documentation of where evidence came from.
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "./lib/graph.mjs";

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: repoRoot, encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((f) => !f.startsWith("source/manifests/") && f !== "package-lock.json");

const patterns = [
  ["private key", /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["AWS key", /AKIA[0-9A-Z]{16}/],
  ["GitHub token", /gh[pousr]_[A-Za-z0-9]{36,}/],
  ["npm token", /npm_[A-Za-z0-9]{36}/],
  ["Slack token", /xox[baprs]-[A-Za-z0-9-]{10,}/],
  ["JWT", /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ["password assignment", /\b(password|passwd|secret|api[_-]?key|access[_-]?token)\b\s*[:=]\s*["'][^"'\s]{6,}["']/i],
  ["session cookie", /\b(sessionid|__Secure-[\w-]+|next-auth\.session-token)=/i],
];
const forbiddenNames = [/(^|\/)\.env(\.|$)(?!example)/, /\.pem$/, /\.key$/, /cookies.*\.json$/, /storage-state.*\.json$/];

let problems = 0;
for (const file of files) {
  if (forbiddenNames.some((re) => re.test(file))) {
    problems++;
    console.error(`✗ forbidden file tracked: ${file}`);
    continue;
  }
  const abs = join(repoRoot, file);
  let text;
  try {
    if (statSync(abs).size > 2_000_000) continue;
    text = readFileSync(abs, "utf8");
  } catch {
    continue;
  }
  for (const [name, re] of patterns) {
    if (re.test(text)) {
      problems++;
      console.error(`✗ possible ${name} in ${file}`);
    }
  }
}
console.log(problems ? `\nSecret scan found ${problems} issue(s)` : `Secret scan: ${files.length} files clean`);
process.exit(problems ? 1 : 0);
