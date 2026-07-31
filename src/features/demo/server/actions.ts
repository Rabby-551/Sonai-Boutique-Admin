"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/auth/session";
import { MockDemoRepository } from "../data/mock-repository";
import type { DemoActionState } from "./action-state";

const confirmationSchema = z.literal("RESET DEMO");

/** Restores fictional fixtures only behind the explicit mock-demo safety gate. */
export async function resetDemoAction(
  _previous: DemoActionState,
  form: FormData,
): Promise<DemoActionState> {
  const user = await requireUser();
  if (user.role !== "owner")
    return { status: "error", message: "Only the Owner can reset demo data." };
  if (env.DATA_SOURCE !== "mock" || env.DEMO_RESET_ENABLED !== "true")
    return {
      status: "error",
      message: "Demo reset is disabled for this environment.",
    };
  const confirmation = confirmationSchema.safeParse(
    String(form.get("confirmation") ?? "").trim(),
  );
  if (!confirmation.success)
    return {
      status: "error",
      message: "Enter RESET DEMO exactly to continue.",
    };

  await new MockDemoRepository().resetFixtures();
  revalidatePath("/", "layout");
  return {
    status: "success",
    message: "Deterministic fictional data has been restored.",
  };
}
