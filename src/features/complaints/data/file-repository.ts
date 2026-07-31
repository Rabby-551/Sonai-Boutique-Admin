import { randomUUID } from "node:crypto";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import type { ShonaiStore } from "@/lib/mock-store/schema";
import { OperationsError } from "@/lib/operations-error";
import type { Complaint, ComplaintStatus } from "../schemas/complaints";
import type {
  ComplaintCreateInput,
  ComplaintListInput,
  ComplaintRepository,
} from "./repository";

const transitions: Record<ComplaintStatus, readonly ComplaintStatus[]> = {
  open: ["acknowledged"],
  acknowledged: ["in_progress"],
  in_progress: ["resolved"],
  resolved: ["closed", "acknowledged"],
  closed: ["acknowledged"],
};

export class FileComplaintRepository implements ComplaintRepository {
  constructor(private readonly store = new ShonaiFileStore()) {}
  async list(input: ComplaintListInput) {
    const store = await this.store.read();
    const query = input.query?.toLowerCase().trim();
    let items = store.complaints.filter(
      (item) =>
        (!input.branchId || item.locationId === input.branchId) &&
        (!query ||
          `${item.caseNumber} ${item.description}`
            .toLowerCase()
            .includes(query) ||
          store.customers
            .find((customer) => customer.id === item.customerId)
            ?.name.toLowerCase()
            .includes(query)) &&
        (!input.status ||
          input.status === "all" ||
          item.status === input.status) &&
        (!input.priority ||
          input.priority === "all" ||
          item.priority === input.priority) &&
        (!input.assignee || item.assignedTo === input.assignee),
    );
    items = items.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const pageSize = Math.min(Math.max(input.pageSize ?? 20, 1), 100);
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const page = Math.min(Math.max(input.page ?? 1, 1), totalPages);
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalItems: items.length,
      totalPages,
    };
  }
  async get(id: string) {
    return (
      (await this.store.read()).complaints.find((item) => item.id === id) ??
      null
    );
  }
  async create(input: ComplaintCreateInput) {
    return this.store.transaction((store) => {
      if (!store.customers.some((item) => item.id === input.customerId))
        throw new OperationsError("NOT_FOUND", "Customer not found.");
      if (
        input.orderId &&
        !store.orders.some(
          (item) =>
            item.id === input.orderId && item.customerId === input.customerId,
        )
      )
        throw new OperationsError(
          "VALIDATION",
          "The selected order does not belong to this customer.",
        );
      const now = new Date().toISOString();
      const date = now.slice(2, 10).replaceAll("-", "");
      const sequence = (store.complaintSequences[date] ?? 0) + 1;
      store.complaintSequences[date] = sequence;
      const complaint: Complaint = {
        id: `cmp-${randomUUID()}`,
        caseNumber: `CMP-${date}-${String(sequence).padStart(4, "0")}`,
        type: input.type,
        category: input.category,
        priority: input.priority,
        status: "open",
        source: input.source,
        customerId: input.customerId,
        orderId: input.orderId,
        productId: input.productId,
        returnId: null,
        locationId: input.locationId,
        assignedTo: null,
        dueAt: input.dueAt,
        description: input.description,
        resolution: null,
        notes: [],
        attachments: [],
        timeline: [
          {
            id: `evt-${randomUUID()}`,
            type: "created",
            detail: "Case logged in the shared service queue.",
            actorId: input.actorId,
            occurredAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      store.complaints.push(complaint);
      return complaint;
    });
  }
  async assign(
    id: string,
    assigneeId: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const item = this.complaint(store, id, expectedVersion);
      item.assignedTo = assigneeId;
      this.event(item, "assigned", `Assigned to ${assigneeId}.`, actorId);
      this.bump(item);
      return item;
    });
  }
  async transition(
    id: string,
    next: ComplaintStatus,
    detail: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const item = this.complaint(store, id, expectedVersion);
      if (!transitions[item.status].includes(next))
        throw new OperationsError(
          "INVALID_TRANSITION",
          `Case cannot move from ${item.status} to ${next}.`,
        );
      if (next === "resolved" && detail.trim().length < 10)
        throw new OperationsError(
          "VALIDATION",
          "Resolution requires at least 10 characters.",
        );
      if (
        (item.status === "resolved" || item.status === "closed") &&
        next === "acknowledged" &&
        detail.trim().length < 3
      )
        throw new OperationsError("VALIDATION", "Reopening requires a reason.");
      item.status = next;
      if (next === "resolved") item.resolution = detail;
      this.event(item, next, detail || `Case moved to ${next}.`, actorId);
      this.bump(item);
      return item;
    });
  }
  async addNote(
    id: string,
    visibility: "internal" | "customer_update",
    body: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const item = this.complaint(store, id, expectedVersion);
      const now = new Date().toISOString();
      item.notes.push({
        id: `note-${randomUUID()}`,
        visibility,
        body,
        actorId,
        createdAt: now,
      });
      this.event(
        item,
        visibility === "customer_update" ? "notification_queued" : "note",
        visibility === "customer_update"
          ? "Fictional customer update recorded; no message was sent."
          : body,
        actorId,
        now,
      );
      this.bump(item, now);
      return item;
    });
  }
  private complaint(store: ShonaiStore, id: string, version: number) {
    const item = store.complaints.find((entry) => entry.id === id);
    if (!item) throw new OperationsError("NOT_FOUND", "Complaint not found.");
    if (item.version !== version)
      throw new OperationsError(
        "CONFLICT",
        "Complaint changed. Refresh and review it.",
      );
    return item;
  }
  private event(
    item: Complaint,
    type: string,
    detail: string,
    actorId: string,
    occurredAt = new Date().toISOString(),
  ) {
    item.timeline.push({
      id: `evt-${randomUUID()}`,
      type,
      detail,
      actorId,
      occurredAt,
    });
  }
  private bump(item: Complaint, now = new Date().toISOString()) {
    item.version += 1;
    item.updatedAt = now;
  }
}
