import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { MockPlatformRepository } from "../data/mock-repository";

const repository = new MockPlatformRepository();

/** Returns the fictional platform status after server-side administration access. */
export async function getPlatformOverview() {
  await requirePermission("settings.view");
  return repository.getOverview();
}
