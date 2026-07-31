import type { OptimizationWorkspace } from "../schemas/optimization";

/** Phase 8 design contract; production analytical and provider adapters remain replaceable. */
export interface OptimizationRepository {
  getWorkspace(): Promise<OptimizationWorkspace>;
}
