"use client";
import { useState, useTransition } from "react";
import { archiveSupplierAction } from "../server/actions";
export function ArchiveSupplierButton({
  id,
  version,
}: {
  id: string;
  version: number;
}) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  return (
    <div>
      <button
        className="button danger"
        disabled={pending}
        onClick={() => {
          if (
            confirm(
              "Archive this supplier? Open purchase orders will block the action.",
            )
          )
            start(async () =>
              setMessage((await archiveSupplierAction(id, version)).message),
            );
        }}
      >
        Archive supplier
      </button>
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
