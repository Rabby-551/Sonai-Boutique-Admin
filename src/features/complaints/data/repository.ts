import type { Complaint, ComplaintStatus } from "../schemas/complaints";

export interface ComplaintListInput {
  query?: string;
  status?: "all" | ComplaintStatus;
  priority?: "all" | Complaint["priority"];
  assignee?: string;
  branchId?: string | null;
  page?: number;
  pageSize?: number;
}

export interface ComplaintPage {
  items: readonly Complaint[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
export interface ComplaintCreateInput {
  type: Complaint["type"];
  category: Complaint["category"];
  priority: Complaint["priority"];
  source: Complaint["source"];
  customerId: string;
  orderId: string | null;
  productId: string | null;
  locationId: Complaint["locationId"];
  dueAt: string | null;
  description: string;
  actorId: string;
}

/** Complaint workflow contract with auditable assignment, notes, and transitions. */
export interface ComplaintRepository {
  list(input: ComplaintListInput): Promise<ComplaintPage>;
  get(id: string): Promise<Complaint | null>;
  create(input: ComplaintCreateInput): Promise<Complaint>;
  assign(
    id: string,
    assigneeId: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<Complaint>;
  transition(
    id: string,
    next: ComplaintStatus,
    detail: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<Complaint>;
  addNote(
    id: string,
    visibility: "internal" | "customer_update",
    body: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<Complaint>;
}
