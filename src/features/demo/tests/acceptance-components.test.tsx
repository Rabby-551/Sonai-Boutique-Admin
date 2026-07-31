import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AcceptanceChecklist } from "../components/acceptance-checklist";
import { AcceptanceMetrics } from "../components/acceptance-metrics";
import { FreezeRegister } from "../components/freeze-register";
import { KnownLimitations } from "../components/known-limitations";
import { MockDemoRepository } from "../data/mock-repository";

describe("Phase 10 acceptance components", () => {
  it("shows the route inventory, freeze policy and limitations", async () => {
    const workspace = await new MockDemoRepository().getAcceptanceWorkspace();
    render(
      <>
        <AcceptanceMetrics workspace={workspace} />
        <FreezeRegister records={workspace.freezeRecords} />
        <KnownLimitations limitations={workspace.limitations} />
      </>,
    );
    expect(
      screen.getByText("Route pages inventoried").parentElement,
    ).toHaveTextContent("71");
    expect(
      screen.getByRole("heading", { name: "Design freeze register" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Sessions and role overrides are fictional/i),
    ).toBeInTheDocument();
  });

  it("keeps stakeholder selections local and announces progress", async () => {
    const user = userEvent.setup();
    const workspace = await new MockDemoRepository().getAcceptanceWorkspace();
    render(<AcceptanceChecklist checks={workspace.signoffChecks} />);
    expect(screen.getByText("0% selected")).toBeInTheDocument();
    await user.click(
      screen.getByRole("checkbox", {
        name: /Business workflows and terminology/i,
      }),
    );
    expect(screen.getByText("20% selected")).toBeInTheDocument();
    expect(
      screen.getByText(/do not create durable approval/i),
    ).toBeInTheDocument();
  });
});
