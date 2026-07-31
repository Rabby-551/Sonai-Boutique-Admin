import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { PreviewGateSummary } from "@/features/preview/components/preview-gate-summary";
import { PreviewHandoff } from "@/features/preview/components/preview-handoff";
import { ReleaseIdentityCard } from "@/features/preview/components/release-identity-card";
import { ReviewRouteDirectory } from "@/features/preview/components/review-route-directory";
import { getPreviewReleaseWorkspace } from "@/features/preview/server/queries";

export default async function PreviewReleasePage() {
  const { user, release } = await getPreviewReleaseWorkspace();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 11 · Local preview"
        title="Preview release handoff"
        description={`Version-linked mock review for ${user.name}'s ${user.role} session. This is not a production deployment.`}
        action={
          <Link className="button secondary" href="/demo">
            Guided demo
          </Link>
        }
      />
      <div className="notice">
        Use fictional information only. Hosting, live identity, providers and
        durable stakeholder approval remain outside this local preview.
      </div>
      <div className="grid-2 balanced preview-overview">
        <ReleaseIdentityCard release={release} />
        <PreviewGateSummary gates={release.gates} />
      </div>
      <ReviewRouteDirectory routes={release.reviewRoutes} />
      <PreviewHandoff
        limitations={release.limitations}
        steps={release.handoffSteps}
      />
    </div>
  );
}
