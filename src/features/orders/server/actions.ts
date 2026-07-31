"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/session";
import { OperationsError } from "@/lib/operations-error";
import { locationIdSchema } from "@/features/inventory/schemas/inventory";
import { paymentMethodSchema } from "../schemas/orders";
import { getOrderRepository } from "../data/repository-factory";
import type { OrderActionState } from "./action-state";

const text = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
const errorState = (error: unknown): OrderActionState => {
  if (error instanceof OperationsError)
    return { status: "error", message: error.message };
  if (error instanceof z.ZodError)
    return {
      status: "error",
      message: error.issues[0]?.message ?? "Check the order information.",
    };
  return {
    status: "error",
    message: "The order could not be updated. Try again.",
  };
};
const refresh = (id?: string) => {
  revalidatePath("/orders");
  revalidatePath("/inventory");
  revalidatePath("/stock-movements");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/orders/${id}`);
};
const enforceBranch = async (orderId: string, branchId: string | null) => {
  if (!branchId) return;
  const order = await getOrderRepository().getOrder(orderId);
  if (order?.fulfillmentLocationId && order.fulfillmentLocationId !== branchId)
    throw new OperationsError(
      "FORBIDDEN",
      "This order belongs to another branch.",
    );
};

export async function createOrderAction(
  _previous: OrderActionState,
  form: FormData,
): Promise<OrderActionState> {
  try {
    const user = await requirePermission("orders.create");
    const parsed = z
      .object({
        source: z.enum(["phone", "branch", "whatsapp", "messenger"]),
        customerName: z.string().trim().min(2).max(120),
        customerPhone: z
          .string()
          .regex(/^\+8801\d{9}$/, "Use a +8801XXXXXXXXX phone number."),
        customerEmail: z.string().email().or(z.literal("")),
        deliveryAddress: z.string().trim().max(500),
        preferredLocationId: locationIdSchema.or(z.literal("")),
        lines: z
          .array(
            z.object({
              variantId: z.string().min(1),
              quantity: z.coerce.number().int().positive(),
            }),
          )
          .min(1),
        deliveryMinor: z.coerce.number().int().nonnegative(),
        paymentMethod: paymentMethodSchema,
        notes: z.string().max(1_000),
      })
      .parse({
        source: text(form, "source"),
        customerName: text(form, "customerName"),
        customerPhone: text(form, "customerPhone"),
        customerEmail: text(form, "customerEmail"),
        deliveryAddress: text(form, "deliveryAddress"),
        preferredLocationId: text(form, "preferredLocationId"),
        lines: form.getAll("variantId").map((variantId, index) => ({
          variantId: String(variantId),
          quantity: form.getAll("quantity")[index],
        })),
        deliveryMinor: Math.round(Number(text(form, "delivery")) * 100),
        paymentMethod: text(form, "paymentMethod"),
        notes: text(form, "notes"),
      });
    if (parsed.source !== "branch" && parsed.deliveryAddress.length < 8)
      throw new OperationsError(
        "VALIDATION",
        "Delivery address is required for remote orders.",
      );
    const order = await getOrderRepository().createOrder({
      ...parsed,
      customerEmail: parsed.customerEmail || null,
      deliveryAddress: parsed.deliveryAddress || null,
      preferredLocationId: user.branchId
        ? locationIdSchema.parse(user.branchId)
        : parsed.preferredLocationId || null,
      lines: parsed.lines,
      actorId: user.id,
      idempotencyKey: text(form, "idempotencyKey") || crypto.randomUUID(),
    });
    refresh(order.id);
    return { status: "success", message: "Order created.", id: order.id };
  } catch (error) {
    return errorState(error);
  }
}

export async function assignOrderAction(
  id: string,
  locationId: string,
  version: number,
) {
  try {
    const user = await requirePermission("orders.fulfill");
    if (user.branchId && user.branchId !== locationId)
      throw new OperationsError(
        "FORBIDDEN",
        "You can only assign your own branch.",
      );
    const order = await getOrderRepository().assignOrder(
      id,
      locationIdSchema.parse(locationId),
      version,
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: "Fulfillment location assigned.",
      id: order.id,
    } satisfies OrderActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function paymentAction(
  id: string,
  outcome: "paid" | "failed",
  version: number,
) {
  try {
    const user = await requirePermission("orders.fulfill");
    await enforceBranch(id, user.branchId);
    const order = await getOrderRepository().recordPayment(
      id,
      outcome,
      version,
      crypto.randomUUID(),
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: `Payment marked ${outcome}.`,
      id: order.id,
    } satisfies OrderActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function confirmOrderAction(id: string, version: number) {
  try {
    const user = await requirePermission("orders.fulfill");
    await enforceBranch(id, user.branchId);
    const order = await getOrderRepository().confirmOrder(
      id,
      version,
      crypto.randomUUID(),
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: "Order confirmed and stock reserved.",
      id: order.id,
    } satisfies OrderActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function transitionOrderAction(
  id: string,
  next: "picking" | "packed" | "shipped" | "delivered",
  version: number,
) {
  try {
    const user = await requirePermission("orders.fulfill");
    await enforceBranch(id, user.branchId);
    const order = await getOrderRepository().transitionOrder(
      id,
      next,
      version,
      crypto.randomUUID(),
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: `Order marked ${next}.`,
      id: order.id,
    } satisfies OrderActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function cancelOrderAction(
  id: string,
  reason: string,
  version: number,
) {
  try {
    const user = await requirePermission("orders.cancel");
    const order = await getOrderRepository().cancelOrder(
      id,
      z.string().min(3).parse(reason),
      version,
      crypto.randomUUID(),
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: "Order cancelled and reservations released.",
      id: order.id,
    } satisfies OrderActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function addOrderNoteAction(
  id: string,
  note: string,
  version: number,
) {
  try {
    const user = await requirePermission("orders.note");
    const order = await getOrderRepository().addNote(
      id,
      z.string().trim().min(3).max(500).parse(note),
      version,
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: "Order note added.",
      id: order.id,
    } satisfies OrderActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function requestReturnAction(
  id: string,
  variantId: string,
  quantity: number,
  reason: string,
  version: number,
) {
  try {
    const user = await requirePermission("orders.cancel");
    const result = await getOrderRepository().requestReturn(
      id,
      [{ variantId, quantity: z.number().int().positive().parse(quantity) }],
      z.string().min(3).parse(reason),
      version,
      user.id,
    );
    refresh(id);
    return {
      status: "success",
      message: "Return requested.",
      id: result.id,
    } satisfies OrderActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function decideReturnAction(
  orderId: string,
  returnId: string,
  decision: "approved" | "rejected",
  version: number,
) {
  try {
    const user = await requirePermission("orders.cancel");
    const result = await getOrderRepository().decideReturn(
      orderId,
      returnId,
      decision,
      version,
      user.id,
    );
    refresh(orderId);
    return {
      status: "success",
      message: `Return ${decision}.`,
      id: result.id,
    } satisfies OrderActionState;
  } catch (error) {
    return errorState(error);
  }
}
export async function receiveReturnAction(
  orderId: string,
  returnId: string,
  version: number,
) {
  try {
    const user = await requirePermission("orders.refund");
    const order = await getOrderRepository().receiveReturn(
      orderId,
      returnId,
      version,
      crypto.randomUUID(),
      user.id,
    );
    refresh(orderId);
    return {
      status: "success",
      message: "Return received, stock restored and refund recorded.",
      id: order.id,
    } satisfies OrderActionState;
  } catch (error) {
    return errorState(error);
  }
}
