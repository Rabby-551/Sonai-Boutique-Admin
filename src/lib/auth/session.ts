import { env } from "@/lib/env";
import { can, type Permission, type Role } from "./permissions";

export interface CurrentUser {
  id: string;
  name: string;
  role: Role;
  branchId: string | null;
}

/** Mock session boundary. API-TODO: replace its adapter when the auth provider is selected. */
export async function getCurrentUser(): Promise<CurrentUser> {
  return {
    id: "usr-owner-01",
    name: "Nusrat Rahman",
    role: env.MOCK_ROLE,
    branchId: null,
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
  if (!can(user.role, permission)) throw new Error("FORBIDDEN");
  return user;
}
