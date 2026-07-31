"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  allPermissions,
  type Permission,
  type Role,
} from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { OperationsError } from "@/lib/operations-error";
import { getAdministrationRepository } from "../data/repository-factory";
import type { AdministrationActionState } from "./action-state";
const value = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
const roleSchema = z.enum(["owner", "manager", "cashier", "support"]);
const failure = (error: unknown): AdministrationActionState => ({
  status: "error",
  message:
    error instanceof OperationsError
      ? error.message
      : error instanceof z.ZodError
        ? (error.issues[0]?.message ?? "Check the administration record.")
        : "The administration record could not be updated.",
});
const refresh = () => {
  [
    "/staff",
    "/users",
    "/roles",
    "/audit-log",
    "/settings",
    "/attendance",
    "/payroll",
  ].forEach((path) => revalidatePath(path));
};
const staffInput = (form: FormData) => ({
  name: z.string().min(2).max(120).parse(value(form, "name")),
  phone: z.string().min(7).max(30).parse(value(form, "phone")),
  email:
    z.string().email().or(z.literal("")).parse(value(form, "email")) || null,
  role: roleSchema.parse(value(form, "role")),
  branchIds: form.getAll("branchIds").map(String).filter(Boolean),
  sharedScope: form.get("sharedScope") === "on",
  hireDate: z.string().date().parse(value(form, "hireDate")),
  status: z
    .enum(["active", "on_leave", "terminated"])
    .parse(value(form, "status")),
  salaryGrade: z.string().min(1).max(40).parse(value(form, "salaryGrade")),
  notes: z.string().max(1_000).parse(value(form, "notes")),
});
export async function createStaffAction(
  _previous: AdministrationActionState,
  form: FormData,
): Promise<AdministrationActionState> {
  try {
    const user = await requirePermission("staff.manage");
    const item = await getAdministrationRepository().createStaff(
      staffInput(form),
      user.id,
    );
    refresh();
    return {
      status: "success",
      message: "Staff profile created.",
      id: item.id,
    };
  } catch (error) {
    return failure(error);
  }
}
export async function updateStaffAction(
  id: string,
  _previous: AdministrationActionState,
  form: FormData,
): Promise<AdministrationActionState> {
  try {
    const user = await requirePermission("staff.manage");
    const item = await getAdministrationRepository().updateStaff(
      id,
      staffInput(form),
      Number(value(form, "expectedVersion")),
      user.id,
    );
    refresh();
    return {
      status: "success",
      message: "Staff profile updated.",
      id: item.id,
    };
  } catch (error) {
    return failure(error);
  }
}
export async function createUserAction(
  _previous: AdministrationActionState,
  form: FormData,
): Promise<AdministrationActionState> {
  try {
    const user = await requirePermission("users.manage");
    const item = await getAdministrationRepository().createUser(
      {
        staffId: z.string().min(1).parse(value(form, "staffId")),
        username: z.string().email().parse(value(form, "username")),
        role: roleSchema.parse(value(form, "role")),
      },
      user.id,
    );
    refresh();
    return {
      status: "success",
      message:
        "Mock user account created; a fictional password reset was recorded.",
      id: item.id,
    };
  } catch (error) {
    return failure(error);
  }
}
export async function updateUserAction(
  id: string,
  role: Role,
  active: boolean,
  version: number,
) {
  try {
    const user = await requirePermission("users.manage");
    await getAdministrationRepository().updateUser(
      id,
      { role, active },
      version,
      user.id,
    );
    refresh();
    return {
      status: "success",
      message: "User account updated.",
      id,
    } satisfies AdministrationActionState;
  } catch (error) {
    return failure(error);
  }
}
export async function resetUserPasswordAction(id: string, version: number) {
  try {
    const user = await requirePermission("users.manage");
    await getAdministrationRepository().requestPasswordReset(
      id,
      version,
      user.id,
    );
    refresh();
    return {
      status: "success",
      message: "Fictional password reset recorded. No credential was stored.",
      id,
    } satisfies AdministrationActionState;
  } catch (error) {
    return failure(error);
  }
}
export async function updateRoleAction(
  role: Role,
  version: number,
  permissions: string[],
) {
  try {
    const user = await requirePermission("roles.manage");
    const validated = permissions.map((item) =>
      z.enum(allPermissions).parse(item),
    ) as Permission[];
    await getAdministrationRepository().updateRole(
      role,
      validated,
      version,
      user.id,
    );
    refresh();
    return {
      status: "success",
      message: `${role} permissions updated.`,
      id: role,
    } satisfies AdministrationActionState;
  } catch (error) {
    return failure(error);
  }
}
export async function updateSettingsAction(
  _previous: AdministrationActionState,
  form: FormData,
): Promise<AdministrationActionState> {
  try {
    const user = await requirePermission("settings.manage");
    await getAdministrationRepository().updateSettings(
      {
        businessName: z
          .string()
          .min(2)
          .max(120)
          .parse(value(form, "businessName")),
        timezone: "Asia/Dhaka",
        currency: "BDT",
        defaultLocationId: z
          .string()
          .min(1)
          .parse(value(form, "defaultLocationId")),
        deliveryChargeMinor: Math.round(
          z.coerce.number().nonnegative().parse(value(form, "deliveryCharge")) *
            100,
        ),
        defaultLowStockThreshold: z.coerce
          .number()
          .int()
          .nonnegative()
          .parse(value(form, "defaultLowStockThreshold")),
        payrollWorkingDays: z.coerce
          .number()
          .int()
          .min(1)
          .max(31)
          .parse(value(form, "payrollWorkingDays")),
        supportEmail: z.string().email().parse(value(form, "supportEmail")),
      },
      Number(value(form, "expectedVersion")),
      user.id,
    );
    refresh();
    return { status: "success", message: "Business settings updated." };
  } catch (error) {
    return failure(error);
  }
}
