import { env } from "@/lib/env";
import { cookies } from "next/headers";
import { can, type Permission, type Role } from "./permissions";
import { OperationsError } from "@/lib/operations-error";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import { createSonaiSupabaseServerClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  name: string;
  role: Role;
  branchId: string | null;
}

const liveRoleMap: Record<string, Role> = {
  owner: "owner",
  manager: "manager",
  catalogue_manager: "manager",
  order_manager: "cashier",
  cashier: "cashier",
  support: "support",
  viewer: "support",
};

async function getMockCurrentUser(): Promise<CurrentUser> {
  const requestedRole =
    env.E2E_TESTING === "true"
      ? (await cookies()).get("shonai-e2e-role")?.value
      : undefined;
  const role: Role = ["owner", "manager", "cashier", "support"].includes(
    requestedRole ?? "",
  )
    ? (requestedRole as Role)
    : env.MOCK_ROLE;
  return {
    id: `usr-${role}-01`,
    name:
      role === "owner"
        ? "Nusrat Rahman"
        : role === "manager"
          ? "Ayesha Karim"
          : role === "cashier"
            ? "Rafi Hasan"
            : "Maliha Noor",
    role,
    branchId: role === "cashier" ? "rupnagar" : null,
  };
}

/** Resolves either the deterministic preview identity or a verified Supabase staff identity. */
export async function getCurrentUser(): Promise<CurrentUser> {
  if (env.AUTH_SOURCE === "mock") return getMockCurrentUser();

  const supabase = await createSonaiSupabaseServerClient();
  if (!supabase)
    throw new OperationsError(
      "FORBIDDEN",
      "Staff authentication is unavailable.",
    );

  const { data: identity, error: identityError } =
    await supabase.auth.getClaims();
  const userId = identity?.claims.sub;
  if (identityError || !userId)
    throw new OperationsError("FORBIDDEN", "Staff sign-in is required.");

  const { data: staffRole, error: roleError } = await supabase
    .from("admin_roles")
    .select("role, branch_id")
    .eq("user_id", userId)
    .maybeSingle();
  const role = liveRoleMap[String(staffRole?.role ?? "")];
  if (roleError || !role)
    throw new OperationsError(
      "FORBIDDEN",
      "This account does not have an active Sonai staff role.",
    );

  const email =
    typeof identity.claims.email === "string"
      ? identity.claims.email
      : "Sonai staff";
  return {
    id: userId,
    name: email.split("@")[0]?.replaceAll(/[._-]+/g, " ") || "Sonai staff",
    role,
    branchId:
      typeof staffRole?.branch_id === "string" ? staffRole.branch_id : null,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  return getCurrentUser();
}

/** Throws a safe authorization error before protected server work begins. */
export async function requirePermission(
  permission: Permission,
): Promise<CurrentUser> {
  const user = await requireUser();
  if (env.AUTH_SOURCE === "supabase") {
    if (!can(user.role, permission))
      throw new OperationsError(
        "FORBIDDEN",
        "You do not have permission for this operation.",
      );
    return user;
  }
  const store = await new ShonaiFileStore().read();
  const profile = store.roleProfiles.find((item) => item.role === user.role);
  const permitted = profile
    ? profile.permissions.includes(permission)
    : can(user.role, permission);
  if (!permitted)
    throw new OperationsError(
      "FORBIDDEN",
      "You do not have permission for this operation.",
    );
  return user;
}
