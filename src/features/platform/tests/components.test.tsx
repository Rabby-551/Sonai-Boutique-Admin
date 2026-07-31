import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IntegrationTable } from "../components/integration-table";
import { ServiceHealthGrid } from "../components/service-health-grid";
import { MockPlatformRepository } from "../data/mock-repository";

describe("platform design components", () => {
  it("renders service health and explicit mock provider boundaries", async () => {
    const overview = await new MockPlatformRepository().getOverview();
    render(
      <>
        <ServiceHealthGrid services={overview.services} />
        <IntegrationTable integrations={overview.integrations} />
      </>,
    );
    expect(
      screen.getByRole("heading", { name: "Service health" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Fictional provider integrations" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No live calls")).toBeInTheDocument();
    expect(
      screen.getByText(/no card or mobile-wallet credentials/i),
    ).toBeInTheDocument();
  });
});
