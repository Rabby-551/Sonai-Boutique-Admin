import "server-only";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/auth/session";
import { MockDemoRepository } from "../data/mock-repository";

const repository = new MockDemoRepository();

/** Returns UAT guidance together with the current role and safe reset capability. */
export async function getDemoWorkspace() {
  const [user, workspace] = await Promise.all([
    requireUser(),
    repository.getWorkspace(),
  ]);
  return {
    user,
    workspace,
    canReset:
      user.role === "owner" &&
      env.DATA_SOURCE === "mock" &&
      env.DEMO_RESET_ENABLED === "true",
  };
}

/** Returns deterministic mock-release evidence without recording approval. */
export async function getAcceptanceWorkspace() {
  const [user, acceptance] = await Promise.all([
    requireUser(),
    repository.getAcceptanceWorkspace(),
  ]);
  return { user, acceptance };
}
