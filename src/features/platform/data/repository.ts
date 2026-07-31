import type { PlatformOverview } from "../schemas/platform";

/** Read contract for the fictional Phase 7 platform and launch-readiness design. */
export interface PlatformRepository {
  getOverview(): Promise<PlatformOverview>;
}
