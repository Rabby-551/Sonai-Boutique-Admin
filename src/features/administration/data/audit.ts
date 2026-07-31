import { randomUUID } from "node:crypto";
import type { ShonaiStore } from "@/lib/mock-store/schema";

/** Appends an immutable, privacy-conscious audit event inside the caller's transaction. */
export function appendAudit(
  store: ShonaiStore,
  input: {
    module: string;
    action: string;
    entityType: string;
    entityId: string;
    actorId: string;
    branchId?: string | null;
    summary: string;
    metadata?: Record<string, string | number | boolean | null>;
  },
) {
  store.auditEvents.push({
    id: `aud-${randomUUID()}`,
    module: input.module,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    actorId: input.actorId,
    branchId: input.branchId ?? null,
    summary: input.summary,
    metadata: input.metadata ?? {},
    occurredAt: new Date().toISOString(),
  });
}
