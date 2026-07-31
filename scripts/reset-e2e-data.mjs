import { rm } from "node:fs/promises";
import path from "node:path";

const workspace = path.resolve(process.cwd());
const target = path.resolve(workspace, ".playwright-data");

if (
  path.dirname(target) !== workspace ||
  path.basename(target) !== ".playwright-data"
) {
  throw new Error(
    "Refusing to reset a path outside the admin panel test workspace.",
  );
}

await rm(target, { recursive: true, force: true });
console.log(`Reset isolated Playwright data: ${target}`);
