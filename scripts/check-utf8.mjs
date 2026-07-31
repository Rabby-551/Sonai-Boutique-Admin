import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const roots = [".", "../docs", "../.codex", "../.github"];
const extensions = new Set([
  ".css",
  ".example",
  ".json",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);
const excluded = new Set([
  "node_modules",
  ".next",
  ".mock-data",
  ".playwright-data",
  ".preview-data",
  "artifacts",
  "coverage",
  "playwright-report",
  "test-results",
]);
const decoder = new TextDecoder("utf-8", { fatal: true });
const mojibake = new RegExp(
  ["00c3.", "00c2.", "00e2\\u20ac", "00f0\\u0178", "00ef\\u00bf\\u00bd"]
    .map((pattern) => `\\u${pattern}`)
    .join("|"),
);

async function collect(directory, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(file, files);
    else if (extensions.has(path.extname(entry.name).toLowerCase()))
      files.push(file);
  }
  return files;
}

const files = [];
for (const root of roots) await collect(path.resolve(root), files);
const failures = [];
for (const file of files) {
  try {
    const content = decoder.decode(await readFile(file));
    if (mojibake.test(content)) failures.push(`${file}: suspected mojibake`);
  } catch {
    failures.push(`${file}: invalid UTF-8`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`UTF-8 verified: ${files.length} text files.`);
}
