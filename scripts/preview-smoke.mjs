import { spawn } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import {
  assertInside,
  ensureDirectory,
  getReleaseConfiguration,
  previewArtifactsDirectory,
  previewEnvironment,
  sha256File,
} from "./preview-common.mjs";
import { extractZip } from "./zip-directory.mjs";

const configuration = getReleaseConfiguration();
const releaseDirectory = path.join(
  previewArtifactsDirectory,
  configuration.releaseVersion,
);
const manifest = JSON.parse(
  await readFile(path.join(releaseDirectory, "release-manifest.json"), "utf8"),
);
const archive = path.join(
  previewArtifactsDirectory,
  `${configuration.releaseVersion}.zip`,
);
if ((await sha256File(archive)) !== manifest.archiveSha256)
  throw new Error("PREVIEW_CHECKSUM_MISMATCH: archive digest differs.");

const smokeRoot = assertInside(
  previewArtifactsDirectory,
  path.join(previewArtifactsDirectory, ".smoke"),
);
await rm(smokeRoot, { recursive: true, force: true });
await ensureDirectory(smokeRoot);
await extractZip(archive, smokeRoot);
const applicationDirectory = path.join(smokeRoot, "app");
const port = 3188;
const child = spawn(process.execPath, ["server.js"], {
  cwd: applicationDirectory,
  env: previewEnvironment(configuration, {
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    MOCK_DATA_DIR: ".preview-data",
    PREVIEW_ARTIFACT_SHA256: manifest.contentSha256,
  }),
  stdio: ["ignore", "pipe", "pipe"],
});
let diagnostics = "";
let exitCode;
child.stdout.on("data", (chunk) => (diagnostics += chunk.toString()));
child.stderr.on("data", (chunk) => (diagnostics += chunk.toString()));
child.on("exit", (code) => (exitCode = code));

async function waitForReady() {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (exitCode !== undefined)
      throw new Error(
        `PREVIEW_SMOKE_FAILED: server exited ${exitCode}. ${diagnostics.slice(-800)}`,
      );
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/ready`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(
    `PREVIEW_SMOKE_FAILED: server did not start. ${diagnostics.slice(-800)}`,
  );
}

try {
  await waitForReady();
  for (const route of [
    "/api/health",
    "/api/ready",
    "/login",
    "/dashboard",
    "/demo",
    "/demo/acceptance",
    "/demo/release",
  ]) {
    const response = await fetch(`http://127.0.0.1:${port}${route}`);
    if (!response.ok)
      throw new Error(
        `PREVIEW_SMOKE_FAILED: ${route} returned ${response.status}.`,
      );
    if (response.headers.get("x-content-type-options") !== "nosniff")
      throw new Error(
        `PREVIEW_SMOKE_FAILED: security headers missing on ${route}.`,
      );
    console.log(`Smoke passed: ${route}`);
  }
  const store = JSON.parse(
    await readFile(
      path.join(applicationDirectory, ".preview-data", "shonai.json"),
      "utf8",
    ),
  );
  if (store.schemaVersion !== 4)
    throw new Error("PREVIEW_STORE_INVALID: expected schema version 4.");
  console.log(
    `Preview artifact smoke passed for ${configuration.releaseVersion}.`,
  );
} finally {
  child.kill();
}
