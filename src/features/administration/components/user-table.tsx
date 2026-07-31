"use client";
import { useState, useTransition } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Staff, UserAccount } from "../schemas/administration";
import { resetUserPasswordAction, updateUserAction } from "../server/actions";
export function UserTable({
  users,
  staff,
  editable,
}: {
  users: UserAccount[];
  staff: Staff[];
  editable: boolean;
}) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const names = Object.fromEntries(staff.map((item) => [item.id, item.name]));
  return (
    <div className="stack">
      <div className="table-card">
        <div className="table-scroll responsive-record-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Staff</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td data-label="User">{item.username}</td>
                  <td data-label="Staff">
                    {names[item.staffId] ?? item.staffId}
                  </td>
                  <td data-label="Role">{item.role}</td>
                  <td data-label="Status">
                    <StatusBadge status={item.active ? "active" : "inactive"} />
                  </td>
                  <td data-label="Actions">
                    {editable ? (
                      <div className="button-group">
                        <button
                          className="button secondary"
                          disabled={pending}
                          onClick={() =>
                            start(async () =>
                              setMessage(
                                (
                                  await updateUserAction(
                                    item.id,
                                    item.role,
                                    !item.active,
                                    item.version,
                                  )
                                ).message,
                              ),
                            )
                          }
                        >
                          {item.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          className="button ghost"
                          disabled={pending}
                          onClick={() =>
                            start(async () =>
                              setMessage(
                                (
                                  await resetUserPasswordAction(
                                    item.id,
                                    item.version,
                                  )
                                ).message,
                              ),
                            )
                          }
                        >
                          Reset password
                        </button>
                      </div>
                    ) : (
                      "Read only"
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
