"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveProductAction } from "../server/actions";

export function ArchiveProductButton({
  id,
  name,
  version,
}: {
  id: string;
  name: string;
  version: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const archive = () =>
    startTransition(async () => {
      const result = await archiveProductAction(id, version);
      setMessage(result.message);
      if (result.status === "success") {
        setOpen(false);
        router.refresh();
      }
    });
  return (
    <>
      <button
        className="button danger"
        onClick={() => setOpen(true)}
        type="button"
      >
        Archive product
      </button>
      {open && (
        <div
          aria-labelledby="archive-title"
          aria-modal="true"
          className="dialog-backdrop"
          role="dialog"
        >
          <div className="dialog">
            <h2 id="archive-title">Archive {name}?</h2>
            <p>
              The product disappears from active catalog views, but its history
              and deep link remain available.
            </p>
            {message && <p className="field-error">{message}</p>}
            <div className="dialog-actions">
              <button
                className="button secondary"
                onClick={() => setOpen(false)}
                type="button"
              >
                Keep product
              </button>
              <button
                className="button danger"
                disabled={pending}
                onClick={archive}
                type="button"
              >
                {pending ? "Archiving…" : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
