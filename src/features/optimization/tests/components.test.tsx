import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DemandForecast } from "../components/demand-forecast";
import { LocalizationCoverage } from "../components/localization-coverage";
import { ReorderSuggestions } from "../components/reorder-suggestions";
import { MockOptimizationRepository } from "../data/mock-repository";

describe("optimization design components", () => {
  it("provides a visual forecast and equivalent accessible data", async () => {
    const workspace = await new MockOptimizationRepository().getWorkspace();
    render(<DemandForecast points={workspace.forecast} />);
    expect(
      screen.getByRole("heading", { name: "Six-week unit outlook" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /W27: forecast 79/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Accessible forecast data")).toBeInTheDocument();
  });

  it("labels reorder output advisory and exposes bilingual samples", async () => {
    const workspace = await new MockOptimizationRepository().getWorkspace();
    render(
      <>
        <ReorderSuggestions suggestions={workspace.reorderSuggestions} />
        <LocalizationCoverage areas={workspace.localizationAreas} />
      </>,
    );
    expect(screen.getByText("Advisory only")).toBeInTheDocument();
    expect(screen.getByText("ইনভেন্টরি")).toHaveAttribute("lang", "bn");
    expect(
      screen.getByText(/ordinary draft purchase orders/i),
    ).toBeInTheDocument();
  });
});
