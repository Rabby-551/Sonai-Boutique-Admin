import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RoleGuide } from "../components/role-guide";
import { ScenarioGrid } from "../components/scenario-grid";
import { UatChecklist } from "../components/uat-checklist";
import { MockDemoRepository } from "../data/mock-repository";

describe("Phase 9 demo components", () => {
  it("links guided scenarios and explains every role", async () => {
    const workspace = await new MockDemoRepository().getWorkspace();
    render(
      <>
        <ScenarioGrid scenarios={workspace.scenarios} />
        <RoleGuide roles={workspace.roles} />
      </>,
    );
    expect(
      screen.getByRole("heading", { name: "Cross-module scenarios" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Start scenario/i }),
    ).toHaveLength(6);
    expect(
      screen.getByText("Rupnagar-scoped customer, order and count work."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Access financial or payroll controls"),
    ).toBeInTheDocument();
  });

  it("tracks manual UAT progress without changing automated evidence", async () => {
    const user = userEvent.setup();
    const workspace = await new MockDemoRepository().getWorkspace();
    render(<UatChecklist checks={workspace.checks} />);
    expect(screen.getByText("63% reviewed")).toBeInTheDocument();
    const manual = screen.getByRole("checkbox", {
      name: /Keyboard route and form review/i,
    });
    const automatic = screen.getByRole("checkbox", {
      name: /Formatting, lint and strict TypeScript/i,
    });
    expect(automatic).toBeDisabled();
    await user.click(manual);
    expect(screen.getByText("75% reviewed")).toBeInTheDocument();
  });
});
