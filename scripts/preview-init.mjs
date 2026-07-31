import { mkdir, rm } from "node:fs/promises";
import {
  assertDirectWorkspaceChild,
  previewDataDirectory,
} from "./preview-common.mjs";

const target = assertDirectWorkspaceChild(
  previewDataDirectory,
  ".preview-data",
);
if (process.argv.includes("--reset"))
  await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
console.log(`Preview data boundary ready: ${target}`);
console.log(
  "Canonical fixtures initialize through the Sonai file store on first access.",
);
