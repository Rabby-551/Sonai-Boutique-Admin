import { env } from "@/lib/env";
import { OperationsClient } from "@/lib/http/operations-client";
import type { Complaint, ComplaintStatus } from "../schemas/complaints";
import type {
  ComplaintCreateInput,
  ComplaintListInput,
  ComplaintPage,
  ComplaintRepository,
} from "./repository";
const query = (input: object) =>
  `?${new URLSearchParams(
    Object.entries(input)
      .filter(([, value]) => value != null)
      .map(([key, value]) => [key, String(value)]),
  )}`;
export class HttpComplaintRepository implements ComplaintRepository {
  private readonly client = new OperationsClient(env.API_BASE_URL);
  list(input: ComplaintListInput) {
    return this.client.request<ComplaintPage>(`/complaints${query(input)}`);
  }
  get(id: string) {
    return this.client.request<Complaint | null>(`/complaints/${id}`);
  }
  create(input: ComplaintCreateInput) {
    return this.post<Complaint>("/complaints", input);
  }
  assign(
    id: string,
    assigneeId: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<Complaint>(`/complaints/${id}/assignment`, {
      assigneeId,
      expectedVersion,
      actorId,
    });
  }
  transition(
    id: string,
    next: ComplaintStatus,
    detail: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<Complaint>(`/complaints/${id}/transitions`, {
      next,
      detail,
      expectedVersion,
      actorId,
    });
  }
  addNote(
    id: string,
    visibility: "internal" | "customer_update",
    body: string,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.post<Complaint>(`/complaints/${id}/notes`, {
      visibility,
      body,
      expectedVersion,
      actorId,
    });
  }
  private post<T>(path: string, body: unknown) {
    return this.client.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}
