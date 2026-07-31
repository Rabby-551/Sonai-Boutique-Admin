import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PreviewGateSummary } from "../components/preview-gate-summary";
import { PreviewHandoff } from "../components/preview-handoff";
import { ReleaseIdentityCard } from "../components/release-identity-card";
import { ReviewRouteDirectory } from "../components/review-route-directory";
import { buildPreviewReleaseManifest } from "../data/release-manifest";

describe("preview handoff components", () => {
  it("shows release identity, gates and navigable review routes", () => {
    const release = buildPreviewReleaseManifest();
    render(
      <>
        <ReleaseIdentityCard release={release} />
        <PreviewGateSummary gates={release.gates} />
        <ReviewRouteDirectory routes={release.reviewRoutes} />
      </>,
    );
    expect(
      screen.getByRole("heading", { name: release.releaseVersion }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Preview gates" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Guided demo/i })).toHaveAttribute(
      "href",
      "/demo",
    );
    expect(screen.getByText("Development review mode")).toBeInTheDocument();
  });

  it("keeps safety steps and production limitations visible", () => {
    const release = buildPreviewReleaseManifest();
    render(
      <PreviewHandoff
        limitations={release.limitations}
        steps={release.handoffSteps}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Safe handoff" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Use only fictional data/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Phase 7 identity and session provider/i),
    ).toBeInTheDocument();
  });
});
