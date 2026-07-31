"use client";
import { useState, useTransition } from "react";
import type { Complaint } from "../schemas/complaints";
import {
  addComplaintNoteAction,
  assignComplaintAction,
  transitionComplaintAction,
} from "../server/actions";
const nextByStatus = {
  open: "acknowledged",
  acknowledged: "in_progress",
  in_progress: "resolved",
  resolved: "closed",
  closed: "acknowledged",
} as const;
export function ComplaintControls({
  complaint,
  staff,
}: {
  complaint: Complaint;
  staff: readonly { id: string; name: string }[];
}) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const run = (task: Promise<{ message: string }>) =>
    start(async () => setMessage((await task).message));
  const next = nextByStatus[complaint.status];
  return (
    <div className="grid-2 balanced">
      <section className="card detail-panel">
        <span className="eyebrow">Ownership</span>
        <h2>Assignment</h2>
        <div className="inline-controls">
          <select
            className="select"
            defaultValue={complaint.assignedTo ?? ""}
            onChange={(event) =>
              run(
                assignComplaintAction(
                  complaint.id,
                  event.target.value,
                  complaint.version,
                ),
              )
            }
          >
            <option value="" disabled>
              Select staff
            </option>
            {staff.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <h3>Progress</h3>
        <form
          className="stack-sm"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            run(
              transitionComplaintAction(
                complaint.id,
                next,
                String(data.get("detail")),
                complaint.version,
              ),
            );
          }}
        >
          <textarea
            className="textarea"
            name="detail"
            rows={3}
            placeholder={
              next === "resolved"
                ? "Required resolution summary"
                : complaint.status === "closed"
                  ? "Required reopening reason"
                  : "Progress detail (optional)"
            }
          />
          <button className="button" disabled={pending}>
            Move to {next.replaceAll("_", " ")}
          </button>
        </form>
      </section>
      <section className="card detail-panel">
        <span className="eyebrow">Case notes</span>
        <h2>Add update</h2>
        <form
          className="stack-sm"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            run(
              addComplaintNoteAction(
                complaint.id,
                String(data.get("visibility")) as
                  "internal" | "customer_update",
                String(data.get("body")),
                complaint.version,
              ),
            );
          }}
        >
          <select className="select" name="visibility">
            <option value="internal">Internal note</option>
            <option value="customer_update">Customer update (mock only)</option>
          </select>
          <textarea
            className="textarea"
            name="body"
            required
            minLength={3}
            rows={4}
          />
          <button className="button" disabled={pending}>
            Add note
          </button>
        </form>
        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
