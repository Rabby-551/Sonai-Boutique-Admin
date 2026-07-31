"use client";
import { useState, useTransition } from "react";
import { allPermissions, type Role } from "@/lib/auth/permissions";
import type { RoleProfile } from "../schemas/administration";
import { updateRoleAction } from "../server/actions";
export function RoleEditor({
  profile,
  editable,
}: {
  profile: RoleProfile;
  editable: boolean;
}) {
  const [selected, setSelected] = useState(profile.permissions);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const toggle = (permission: string) =>
    setSelected((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  return (
    <section className="card detail-panel stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{profile.role}</span>
          <h2>{profile.label}</h2>
        </div>
        <strong>{selected.length} permissions</strong>
      </div>
      <div className="permission-grid">
        {allPermissions.map((permission) => (
          <label className="inline-controls" key={permission}>
            <input
              type="checkbox"
              checked={selected.includes(permission)}
              disabled={!editable || profile.role === "owner"}
              onChange={() => toggle(permission)}
            />
            {permission}
          </label>
        ))}
      </div>
      {editable && profile.role !== "owner" && (
        <button
          className="button"
          disabled={pending}
          onClick={() =>
            start(async () =>
              setMessage(
                (
                  await updateRoleAction(
                    profile.role as Role,
                    profile.version,
                    selected,
                  )
                ).message,
              ),
            )
          }
        >
          Save permissions
        </button>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
