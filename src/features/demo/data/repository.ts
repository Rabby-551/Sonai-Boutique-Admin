import type { AcceptanceWorkspace, DemoWorkspace } from "../schemas/demo";

/** Supplies deterministic UAT guidance and restores canonical mock fixtures. */
export interface DemoRepository {
  getWorkspace(): Promise<DemoWorkspace>;
  getAcceptanceWorkspace(): Promise<AcceptanceWorkspace>;
  resetFixtures(): Promise<void>;
}
