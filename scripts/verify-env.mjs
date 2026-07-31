const allowedSources = new Set(["mock", "api"]);
const allowedRoles = new Set(["owner", "manager", "cashier", "support"]);
const source = process.env.DATA_SOURCE || "mock";
const role = process.env.MOCK_ROLE || "owner";
const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:4000/api";
const failures = [];
const demoReset = process.env.DEMO_RESET_ENABLED || "false";
const previewMode = process.env.PREVIEW_MODE || "false";
const previewVersion =
  process.env.PREVIEW_RELEASE_VERSION || "local-development";
const previewAccess = process.env.PREVIEW_ACCESS_POLICY || "local";
const previewRevision = process.env.PREVIEW_SOURCE_REVISION || "uncommitted";

if (!allowedSources.has(source))
  failures.push("DATA_SOURCE must be mock or api.");
if (!allowedRoles.has(role)) failures.push("MOCK_ROLE is invalid.");
if (!["true", "false"].includes(demoReset))
  failures.push("DEMO_RESET_ENABLED must be true or false.");
if (source !== "mock" && demoReset === "true")
  failures.push("DEMO_RESET_ENABLED can only be true in mock data mode.");
if (!["true", "false"].includes(previewMode))
  failures.push("PREVIEW_MODE must be true or false.");
if (!["local", "restricted-host"].includes(previewAccess))
  failures.push("PREVIEW_ACCESS_POLICY is invalid.");
if (!/^[a-zA-Z0-9._-]+$/.test(previewRevision))
  failures.push("PREVIEW_SOURCE_REVISION contains unsafe characters.");
if (previewMode === "true") {
  if (source !== "mock")
    failures.push("Preview mode requires DATA_SOURCE=mock.");
  if (previewVersion === "local-development")
    failures.push("Preview mode requires an immutable release version.");
  if (!process.env.PREVIEW_BUILT_AT)
    failures.push("Preview mode requires PREVIEW_BUILT_AT.");
  else if (Number.isNaN(Date.parse(process.env.PREVIEW_BUILT_AT)))
    failures.push("PREVIEW_BUILT_AT must be an ISO timestamp.");
  if (!process.env.MOCK_DATA_DIR)
    failures.push("Preview mode requires an isolated MOCK_DATA_DIR.");
}
try {
  new URL(apiBaseUrl);
} catch {
  failures.push("API_BASE_URL must be an absolute URL.");
}
if (
  process.env.NODE_ENV === "production" &&
  source === "api" &&
  /localhost|127\.0\.0\.1/.test(apiBaseUrl)
) {
  failures.push("Production API mode cannot use a loopback API_BASE_URL.");
}
if (process.env.NODE_ENV === "production" && source === "mock") {
  console.warn(
    "Warning: production build is using the fictional mock data source.",
  );
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Environment verified for ${source} data mode${previewMode === "true" ? ` and preview ${previewVersion}` : ""}.`,
  );
}
