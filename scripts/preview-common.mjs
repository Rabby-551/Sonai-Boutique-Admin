import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export const workspace = path.resolve(process.cwd());
export const previewDataDirectory = path.join(workspace, ".preview-data");
export const previewArtifactsDirectory = path.join(
  workspace,
  "artifacts",
  "preview",
);

export function assertDirectWorkspaceChild(target, expectedName) {
  const resolved = path.resolve(target);
  if (
    path.dirname(resolved) !== workspace ||
    path.basename(resolved) !== expectedName
  )
    throw new Error(`PREVIEW_RESET_TARGET_UNSAFE: ${expectedName} is invalid.`);
  return resolved;
}

export function assertInside(base, target) {
  const resolvedBase = path.resolve(base);
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(resolvedBase, resolvedTarget);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative))
    throw new Error("PREVIEW_RESET_TARGET_UNSAFE: path escaped its boundary.");
  return resolvedTarget;
}

export function getReleaseConfiguration() {
  const releaseVersion =
    process.env.PREVIEW_RELEASE_VERSION || "mock-preview-2026.07.31";
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{2,63}$/.test(releaseVersion))
    throw new Error("PREVIEW_RELEASE_ID_MISSING: invalid release version.");
  let sourceRevision = process.env.PREVIEW_SOURCE_REVISION;
  if (!sourceRevision) {
    try {
      sourceRevision = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
        cwd: workspace,
        encoding: "utf8",
      }).trim();
    } catch {
      sourceRevision = "uncommitted";
    }
  }
  const builtAt = process.env.PREVIEW_BUILT_AT || new Date().toISOString();
  const accessPolicy = process.env.PREVIEW_ACCESS_POLICY || "local";
  const dataSource = process.env.DATA_SOURCE || "mock";
  const mockDataDirectory =
    process.env.MOCK_DATA_DIR || path.relative(workspace, previewDataDirectory);
  if (dataSource !== "mock")
    throw new Error("PREVIEW_DATA_SOURCE_UNSAFE: preview requires mock data.");
  if (accessPolicy !== "local")
    throw new Error(
      "PREVIEW_CONFIG_INVALID: this package implements local access only.",
    );
  if (path.resolve(workspace, mockDataDirectory) !== previewDataDirectory)
    throw new Error(
      "PREVIEW_RESET_TARGET_UNSAFE: preview data must use .preview-data.",
    );
  return {
    releaseVersion,
    sourceRevision,
    builtAt,
    accessPolicy,
    dataSource,
    mockDataDirectory: ".preview-data",
  };
}

export function previewEnvironment(configuration, additions = {}) {
  return {
    ...process.env,
    DATA_SOURCE: "mock",
    MOCK_DATA_DIR: configuration.mockDataDirectory,
    MOCK_ROLE: "owner",
    DEMO_RESET_ENABLED: "true",
    PREVIEW_MODE: "true",
    PREVIEW_RELEASE_VERSION: configuration.releaseVersion,
    PREVIEW_ACCESS_POLICY: configuration.accessPolicy,
    PREVIEW_SOURCE_REVISION: configuration.sourceRevision,
    PREVIEW_BUILT_AT: configuration.builtAt,
    ...additions,
  };
}

export async function walkFiles(directory) {
  const results = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...(await walkFiles(absolute)));
    else if (entry.isFile()) results.push(absolute);
  }
  return results.sort((left, right) => left.localeCompare(right));
}

export async function sha256File(filePath) {
  return createHash("sha256")
    .update(await readFile(filePath))
    .digest("hex");
}

export async function writeChecksums(directory, writeFile) {
  const lines = [];
  for (const file of await walkFiles(directory)) {
    const relative = path.relative(directory, file).replaceAll(path.sep, "/");
    if (relative === "checksums.sha256") continue;
    lines.push(`${await sha256File(file)}  ${relative}`);
  }
  const content = `${lines.join("\n")}\n`;
  await writeFile(path.join(directory, "checksums.sha256"), content, "utf8");
  return createHash("sha256").update(content).digest("hex");
}

export async function ensureDirectory(directory) {
  await mkdir(directory, { recursive: true });
  return directory;
}

export async function findFile(directory, name) {
  const match = (await walkFiles(directory)).find(
    (file) => path.basename(file) === name,
  );
  if (!match) throw new Error(`PREVIEW_ARTIFACT_INCOMPLETE: ${name} missing.`);
  return match;
}

export async function fileSize(filePath) {
  return (await stat(filePath)).size;
}
