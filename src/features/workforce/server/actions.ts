"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/session";
import { OperationsError } from "@/lib/operations-error";
import { getWorkforceRepository } from "../data/repository-factory";
import type { WorkforceActionState } from "./action-state";
const value = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
const failure = (error: unknown): WorkforceActionState => ({
  status: "error",
  message:
    error instanceof OperationsError
      ? error.message
      : error instanceof z.ZodError
        ? (error.issues[0]?.message ?? "Check the workforce record.")
        : "The workforce record could not be updated.",
});
const refresh = (id?: string) => {
  revalidatePath("/attendance");
  revalidatePath("/attendance/leave");
  revalidatePath("/payroll");
  revalidatePath("/reports");
  revalidatePath("/audit-log");
  if (id) revalidatePath(`/payroll/${id}`);
};
export async function recordAttendanceAction(
  _previous: WorkforceActionState,
  form: FormData,
): Promise<WorkforceActionState> {
  try {
    const user = await requirePermission("attendance.view");
    const item = await getWorkforceRepository().recordAttendance(
      {
        staffId: z.string().min(1).parse(value(form, "staffId")),
        date: z.string().date().parse(value(form, "date")),
        status: z
          .enum(["present", "absent", "leave", "weekend"])
          .parse(value(form, "status")),
        checkIn: value(form, "checkIn")
          ? new Date(
              `${value(form, "date")}T${value(form, "checkIn")}:00+06:00`,
            ).toISOString()
          : null,
        checkOut: value(form, "checkOut")
          ? new Date(
              `${value(form, "date")}T${value(form, "checkOut")}:00+06:00`,
            ).toISOString()
          : null,
        note: z.string().max(500).parse(value(form, "note")),
      },
      value(form, "expectedVersion")
        ? Number(value(form, "expectedVersion"))
        : null,
      {
        actorId: user.id,
        branchId: user.branchId,
        selfOnly: user.role === "cashier" || user.role === "support",
      },
    );
    refresh();
    return { status: "success", message: "Attendance recorded.", id: item.id };
  } catch (error) {
    return failure(error);
  }
}
export async function createLeaveAction(
  _previous: WorkforceActionState,
  form: FormData,
): Promise<WorkforceActionState> {
  try {
    const user = await requirePermission("attendance.view");
    const item = await getWorkforceRepository().createLeave(
      {
        staffId: z.string().min(1).parse(value(form, "staffId")),
        startDate: z.string().date().parse(value(form, "startDate")),
        endDate: z.string().date().parse(value(form, "endDate")),
        reason: z.string().min(3).max(500).parse(value(form, "reason")),
      },
      {
        actorId: user.id,
        branchId: user.branchId,
        selfOnly: user.role === "cashier" || user.role === "support",
      },
    );
    refresh();
    return {
      status: "success",
      message: "Leave request submitted.",
      id: item.id,
    };
  } catch (error) {
    return failure(error);
  }
}
export async function decideLeaveAction(
  id: string,
  decision: "approved" | "rejected",
  reason: string,
  version: number,
) {
  try {
    const user = await requirePermission("attendance.approve");
    await getWorkforceRepository().decideLeave(
      id,
      decision,
      reason,
      version,
      user.id,
    );
    refresh();
    return {
      status: "success",
      message: `Leave request ${decision}.`,
      id,
    } satisfies WorkforceActionState;
  } catch (error) {
    return failure(error);
  }
}
export async function setSalaryAction(
  _previous: WorkforceActionState,
  form: FormData,
): Promise<WorkforceActionState> {
  try {
    const user = await requirePermission("payroll.manage");
    const item = await getWorkforceRepository().setSalary(
      {
        staffId: z.string().min(1).parse(value(form, "staffId")),
        effectiveFrom: z.string().date().parse(value(form, "effectiveFrom")),
        baseSalaryMinor: Math.round(Number(value(form, "baseSalary")) * 100),
        fixedAllowanceMinor: Math.round(
          Number(value(form, "allowance") || 0) * 100,
        ),
        fixedDeductionMinor: Math.round(
          Number(value(form, "deduction") || 0) * 100,
        ),
        grade: z.string().min(1).max(40).parse(value(form, "grade")),
        note: z.string().max(500).parse(value(form, "note")),
      },
      user.id,
    );
    refresh();
    return {
      status: "success",
      message: "Salary record created.",
      id: item.id,
    };
  } catch (error) {
    return failure(error);
  }
}
export async function createPayrollAction(
  _previous: WorkforceActionState,
  form: FormData,
): Promise<WorkforceActionState> {
  try {
    const user = await requirePermission("payroll.manage");
    const item = await getWorkforceRepository().createPayroll(
      {
        month: z
          .string()
          .regex(/^\d{4}-\d{2}$/)
          .parse(value(form, "month")),
        locationId: value(form, "locationId") || null,
      },
      user.id,
    );
    refresh(item.id);
    return {
      status: "success",
      message: "Payroll draft created.",
      id: item.id,
    };
  } catch (error) {
    return failure(error);
  }
}
export async function adjustPayrollAction(
  id: string,
  _previous: WorkforceActionState,
  form: FormData,
): Promise<WorkforceActionState> {
  try {
    const user = await requirePermission("payroll.manage");
    await getWorkforceRepository().adjustPayroll(
      id,
      value(form, "staffId"),
      Math.round(Number(value(form, "adjustment")) * 100),
      value(form, "reason"),
      Number(value(form, "expectedVersion")),
      user.id,
    );
    refresh(id);
    return { status: "success", message: "Payroll adjustment applied.", id };
  } catch (error) {
    return failure(error);
  }
}
export async function transitionPayrollAction(
  id: string,
  next: "submitted" | "approved" | "paid",
  version: number,
) {
  try {
    const user = await requirePermission(
      next === "submitted" ? "payroll.manage" : "payroll.approve",
    );
    await getWorkforceRepository().transitionPayroll(
      id,
      next,
      version,
      crypto.randomUUID(),
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: `Payroll marked ${next}.`,
      id,
    } satisfies WorkforceActionState;
  } catch (error) {
    return failure(error);
  }
}
