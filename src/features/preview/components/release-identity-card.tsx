import { Fingerprint, PackageCheck } from "lucide-react";
import type { PreviewReleaseManifest } from "../schemas/preview";

export function ReleaseIdentityCard({
  release,
}: {
  release: PreviewReleaseManifest;
}) {
  const builtAt = release.builtAt
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Dhaka",
      }).format(new Date(release.builtAt))
    : "Created when the preview package is built";
  return (
    <section className="card preview-identity" aria-labelledby="release-title">
      <div className="section-title compact">
        <div>
          <div className="eyebrow">Release identity</div>
          <h2 id="release-title">{release.releaseVersion}</h2>
        </div>
        <Fingerprint aria-hidden size={24} />
      </div>
      <dl className="definition-grid">
        <div>
          <dt>Source revision</dt>
          <dd>{release.sourceRevision}</dd>
        </div>
        <div>
          <dt>Built</dt>
          <dd>{builtAt}</dd>
        </div>
        <div>
          <dt>Access</dt>
          <dd>{release.accessPolicy}</dd>
        </div>
        <div>
          <dt>Data</dt>
          <dd>Deterministic mock</dd>
        </div>
        <div>
          <dt>Store schema</dt>
          <dd>v{release.storeSchemaVersion}</dd>
        </div>
        <div>
          <dt>Routes</dt>
          <dd>{release.routeCount}</dd>
        </div>
      </dl>
      <div
        className={`status-chip ${release.previewMode ? "success" : "warning"}`}
      >
        <PackageCheck aria-hidden size={16} />
        {release.previewMode
          ? "Packaged preview mode"
          : "Development review mode"}
      </div>
    </section>
  );
}
