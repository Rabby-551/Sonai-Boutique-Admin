import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { OperationsError } from "@/lib/operations-error";
import { redirect } from "next/navigation";
import { AdminShellClient } from "./admin-shell-client";

async function resolveCurrentUser() {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (error instanceof OperationsError && error.code === "FORBIDDEN") {
      redirect("/login");
    }
    throw error;
  }
}

export async function AdminShell({ children }: { children: ReactNode }) {
  const user = await resolveCurrentUser();
  return <AdminShellClient user={user}>{children}</AdminShellClient>;
}
