import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { LocalizationCoverage } from "@/features/optimization/components/localization-coverage";
import { MockDesignNotice } from "@/features/optimization/components/mock-design-notice";
import { getLocalizationWorkspace } from "@/features/optimization/server/queries";

export default async function LocalizationPage() {
  const workspace = await getLocalizationWorkspace();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 8 · Localization"
        title="English and Bengali readiness"
        description="Typed translation coverage, review progress and mixed-script design samples."
        action={
          <Link className="button secondary" href="/settings">
            Business settings
          </Link>
        }
      />
      <MockDesignNotice>
        Bangla samples demonstrate layout only and are not a professional
        translation sign-off.
      </MockDesignNotice>
      <LocalizationCoverage areas={workspace.localizationAreas} />
    </div>
  );
}
