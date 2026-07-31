"use client";
import { useState, useTransition } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { LeaveRequest } from "../schemas/workforce";
import { decideLeaveAction } from "../server/actions";
export function LeaveTable({
  requests,
  staffNames,
  canApprove,
}: {
  requests: LeaveRequest[];
  staffNames: Record<string, string>;
  canApprove: boolean;
}) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  if (!requests.length)
    return (
      <div className="empty-state">
        <h2>No leave requests</h2>
        <p>New requests will appear here.</p>
      </div>
    );
  return (
    <div className="stack">
      <div className="table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Staff</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <tr key={item.id}>
                  <td>{staffNames[item.staffId] ?? item.staffId}</td>
                  <td>
                    {item.startDate}
                    <small>to {item.endDate}</small>
                  </td>
                  <td>{item.days}</td>
                  <td>{item.reason}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    {canApprove && item.status === "pending" ? (
                      <div className="button-group">
                        <button
                          className="button secondary"
                          disabled={pending}
                          onClick={() =>
                            start(async () =>
                              setMessage(
                                (
                                  await decideLeaveAction(
                                    item.id,
                                    "approved",
                                    "Approved by manager.",
                                    item.version,
                                  )
                                ).message,
                              ),
                            )
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="button ghost"
                          disabled={pending}
                          onClick={() =>
                            start(async () =>
                              setMessage(
                                (
                                  await decideLeaveAction(
                                    item.id,
                                    "rejected",
                                    "Rejected after review.",
                                    item.version,
                                  )
                                ).message,
                              ),
                            )
                          }
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
