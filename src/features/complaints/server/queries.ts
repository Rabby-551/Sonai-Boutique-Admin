import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { getComplaintRepository } from "../data/repository-factory";
import type { ComplaintListInput } from "../data/repository";
import { getCustomerRepository } from "@/features/customers/data/repository-factory";
import { getOrderRepository } from "@/features/orders/data/repository-factory";

export async function listComplaints(input: ComplaintListInput) {
  const user = await requirePermission("complaints.view");
  return getComplaintRepository().list({ ...input, branchId: user.branchId });
}
export async function getComplaint(id: string) {
  await requirePermission("complaints.view");
  return getComplaintRepository().get(id);
}
export async function complaintFormOptions() {
  await requirePermission("complaints.create");
  const [customers, orders] = await Promise.all([
    getCustomerRepository().list({ pageSize: 100 }),
    getOrderRepository().listOrders({ pageSize: 100 }),
  ]);
  return {
    customers: customers.items,
    orders: orders.items,
    staff: [
      { id: "usr-owner-01", name: "Nusrat Rahman" },
      { id: "usr-manager-01", name: "Ayesha Karim" },
      { id: "usr-cashier-01", name: "Rafi Hasan" },
      { id: "usr-support-01", name: "Maliha Noor" },
    ],
  };
}
