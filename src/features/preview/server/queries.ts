import "server-only";
import { requireUser } from "@/lib/auth/session";
import { buildPreviewReleaseManifest } from "../data/release-manifest";

/** Returns sanitized release evidence for an authenticated mock reviewer. */
export async function getPreviewReleaseWorkspace() {
  const user = await requireUser();
  return { user, release: buildPreviewReleaseManifest() };
}
