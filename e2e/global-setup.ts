import { rm } from "node:fs/promises";
import path from "node:path";

export default async function globalSetup() {
  const target = path.join(process.cwd(), ".playwright-data");
  await rm(target, { recursive: true, force: true });
}
