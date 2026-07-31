import { access, readFile } from "node:fs/promises";
import path from "node:path";
import {
  getReleaseConfiguration,
  previewArtifactsDirectory,
  sha256File,
  workspace,
} from "./preview-common.mjs";

const configuration = getReleaseConfiguration();
const required = [
  "next.config.ts",
  "package-lock.json",
  "src/features/preview/schemas/preview.ts",
  "src/app/(admin)/demo/release/page.tsx",
  "../docs/phase_11_preview_packaging_handoff_plan.md",
];
for (const relative of required)
  await access(path.resolve(workspace, relative));

if (process.argv.includes("--artifact")) {
  const releaseDirectory = path.join(
    previewArtifactsDirectory,
    configuration.releaseVersion,
  );
  const manifest = JSON.parse(
    await readFile(
      path.join(releaseDirectory, "release-manifest.json"),
      "utf8",
    ),
  );
  const archive = path.join(
    previewArtifactsDirectory,
    `${configuration.releaseVersion}.zip`,
  );
  if ((await sha256File(archive)) !== manifest.archiveSha256)
    throw new Error("PREVIEW_CHECKSUM_MISMATCH: archive digest differs.");
}

console.log(
  JSON.stringify(
    {
      code: "PREVIEW_VERIFIED",
      releaseVersion: configuration.releaseVersion,
      sourceRevision: configuration.sourceRevision,
      accessPolicy: configuration.accessPolicy,
      dataSource: configuration.dataSource,
    },
    null,
    2,
  ),
);
