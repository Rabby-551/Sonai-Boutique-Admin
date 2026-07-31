"use client";
import { useState, useTransition } from "react";
import { archiveCustomerAction } from "../server/actions";

export function ArchiveCustomerButton({
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
          if (confirm("Archive this customer while preserving history?"))
            start(async () =>
              setMessage((await archiveCustomerAction(id, version)).message),
            );
        }}
      >
        Archive customer
      </button>
      {message && (
        <span className="help" role="status">
          {" "}
          {message}
        </span>
      )}
    </div>
  );
}
