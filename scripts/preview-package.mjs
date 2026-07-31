import { spawn } from "node:child_process";
import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  assertInside,
  ensureDirectory,
  fileSize,
  getReleaseConfiguration,
  previewArtifactsDirectory,
  previewEnvironment,
  sha256File,
  workspace,
  writeChecksums,
} from "./preview-common.mjs";
import { zipDirectory } from "./zip-directory.mjs";

function run(command, arguments_, environment) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, {
      cwd: workspace,
      env: environment,
      stdio: "inherit",
      shell: false,
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited ${code}.`)),
    );
  });
}

const configuration = getReleaseConfiguration();
const environment = previewEnvironment(configuration);
const npmCli = process.env.npm_execpath;
if (!npmCli)
  throw new Error("PREVIEW_CONFIG_INVALID: npm CLI path is unavailable.");
await run(
  process.execPath,
  ["scripts/preview-init.mjs", "--reset"],
  environment,
);
await run(process.execPath, [npmCli, "run", "build"], environment);

await ensureDirectory(previewArtifactsDirectory);
const releaseDirectory = assertInside(
  previewArtifactsDirectory,
  path.join(previewArtifactsDirectory, configuration.releaseVersion),
);
const archive = assertInside(
  previewArtifactsDirectory,
  path.join(previewArtifactsDirectory, `${configuration.releaseVersion}.zip`),
);
await rm(releaseDirectory, { recursive: true, force: true });
await rm(archive, { force: true });
await mkdir(releaseDirectory, { recursive: true });

const standaloneRoot = path.join(workspace, ".next", "standalone");
const serverFile = path.join(standaloneRoot, "server.js");
await access(serverFile);
const serverDirectory = path.dirname(serverFile);
const applicationDirectory = path.join(releaseDirectory, "app");
await cp(serverDirectory, applicationDirectory, { recursive: true });
await rm(path.join(applicationDirectory, ".mock-data"), {
  recursive: true,
  force: true,
});
await rm(path.join(applicationDirectory, ".preview-data"), {
  recursive: true,
  force: true,
});
await cp(
  path.join(workspace, ".next", "static"),
  path.join(applicationDirectory, ".next", "static"),
  { recursive: true },
);
await cp(
  path.join(workspace, "public"),
  path.join(applicationDirectory, "public"),
  { recursive: true },
);

const documentsDirectory = path.join(releaseDirectory, "docs");
await mkdir(documentsDirectory, { recursive: true });
for (const name of [
  "admin_panel_preview_runbook.md",
  "admin_panel_preview_release_notes.md",
  "admin_panel_preview_feedback_template.md",
])
  await cp(
    path.join(workspace, "..", "docs", name),
    path.join(documentsDirectory, name),
  );

const previewEnvironmentText = [
  "DATA_SOURCE=mock",
  "MOCK_DATA_DIR=.preview-data",
  "MOCK_ROLE=owner",
  "DEMO_RESET_ENABLED=true",
  "PREVIEW_MODE=true",
  `PREVIEW_RELEASE_VERSION=${configuration.releaseVersion}`,
  `PREVIEW_ACCESS_POLICY=${configuration.accessPolicy}`,
  `PREVIEW_SOURCE_REVISION=${configuration.sourceRevision}`,
  `PREVIEW_BUILT_AT=${configuration.builtAt}`,
  "",
].join("\n");
await writeFile(
  path.join(releaseDirectory, ".env.preview.example"),
  previewEnvironmentText,
  "utf8",
);
await writeFile(
  path.join(releaseDirectory, "start-preview.cmd"),
  '@echo off\ncd /d "%~dp0app"\nset DATA_SOURCE=mock\nset MOCK_DATA_DIR=.preview-data\nset PREVIEW_MODE=true\nset PREVIEW_RELEASE_VERSION=' +
    configuration.releaseVersion +
    "\nset PREVIEW_ACCESS_POLICY=local\nset PREVIEW_SOURCE_REVISION=" +
    configuration.sourceRevision +
    "\nset PREVIEW_BUILT_AT=" +
    configuration.builtAt +
    "\nnode server.js\n",
  "utf8",
);
await writeFile(
  path.join(releaseDirectory, "start-preview.sh"),
  '#!/usr/bin/env sh\ncd "$(dirname "$0")/app" || exit 1\nDATA_SOURCE=mock MOCK_DATA_DIR=.preview-data PREVIEW_MODE=true PREVIEW_RELEASE_VERSION=' +
    configuration.releaseVersion +
    " PREVIEW_ACCESS_POLICY=local PREVIEW_SOURCE_REVISION=" +
    configuration.sourceRevision +
    " PREVIEW_BUILT_AT=" +
    configuration.builtAt +
    " node server.js\n",
  "utf8",
);

const contentSha256 = await writeChecksums(releaseDirectory, writeFile);
const manifest = {
  packageFormatVersion: 1,
  releaseVersion: configuration.releaseVersion,
  sourceRevision: configuration.sourceRevision,
  builtAt: configuration.builtAt,
  nodeRuntime: process.version,
  accessPolicy: configuration.accessPolicy,
  dataSource: "mock",
  contentSha256,
  archiveSha256: "pending",
};
await writeFile(
  path.join(releaseDirectory, "release-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8",
);
await zipDirectory(releaseDirectory, archive, new Date(configuration.builtAt));
manifest.archiveSha256 = await sha256File(archive);
await writeFile(
  path.join(releaseDirectory, "release-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8",
);
await writeFile(
  `${archive}.sha256`,
  `${manifest.archiveSha256}  ${path.basename(archive)}\n`,
  "utf8",
);
console.log(`Preview package: ${archive}`);
console.log(`Archive size: ${await fileSize(archive)} bytes`);
console.log(`SHA-256: ${manifest.archiveSha256}`);
