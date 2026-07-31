"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "../schemas/orders";
import { addOrderNoteAction } from "../server/actions";

export function OrderNoteForm({ order }: { order: Order }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  return (
    <section className="card detail-panel">
      <h2>Add support note</h2>
      {message && (
        <div className="form-message" role="status">
          {message}
        </div>
      )}
      <div className="inline-controls">
        <label className="sr-only" htmlFor="order-note">
          Note
        </label>
        <input
          className="input"
          id="order-note"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Operational or customer-support note"
          value={note}
        />
        <button
          className="button"
          disabled={pending || note.trim().length < 3}
          onClick={() =>
            startTransition(async () => {
              const result = await addOrderNoteAction(
                order.id,
                note,
                order.version,
              );
              setMessage(result.message);
              if (result.status === "success") {
                setNote("");
                router.refresh();
              }
            })
          }
          type="button"
        >
          Add note
        </button>
      </div>
    </section>
  );
}
