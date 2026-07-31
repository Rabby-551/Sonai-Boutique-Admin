import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

async function collect(directory, predicate, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(file, predicate, files);
    else if (predicate(file)) files.push(file);
  }
  return files;
}

const source = path.resolve("src");
const pages = await collect(path.join(source, "app"), (file) =>
  file.endsWith(`${path.sep}page.tsx`),
);
const components = await collect(
  source,
  (file) =>
    file.endsWith(".tsx") && file.includes(`${path.sep}components${path.sep}`),
);
const failures = [];
const results = [];

for (const [kind, files, limit] of [
  ["route page", pages, 80],
  ["component", components, 180],
]) {
  for (const file of files) {
    const lines = (await readFile(file, "utf8")).split(/\r?\n/).length;
    results.push({ kind, file, lines });
    if (lines > limit)
      failures.push(
        `${kind} ${path.relative(source, file)} has ${lines} lines (limit ${limit})`,
      );
  }
}

const largestPage = results
  .filter((item) => item.kind === "route page")
  .sort((a, b) => b.lines - a.lines)[0];
const largestComponent = results
  .filter((item) => item.kind === "component")
  .sort((a, b) => b.lines - a.lines)[0];
console.log(`Largest route page: ${largestPage?.lines ?? 0} lines.`);
console.log(`Largest component: ${largestComponent?.lines ?? 0} lines.`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
