"use client";
import { useState, useTransition } from "react";
import type { CustomerDetail } from "../data/repository";
import { adjustLoyaltyAction } from "../server/actions";

export function LoyaltyPanel({
  customer,
  canAdjust,
}: {
  customer: CustomerDetail;
  canAdjust: boolean;
}) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  return (
    <section className="card detail-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Ledger</span>
          <h2>Loyalty history</h2>
        </div>
      </div>
      {canAdjust && customer.loyaltyEnrolledAt && (
        <form
          className="inline-controls"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            start(async () =>
              setMessage(
                (
                  await adjustLoyaltyAction(
                    customer.id,
                    Number(data.get("points")),
                    String(data.get("reason")),
                  )
                ).message,
              ),
            );
          }}
        >
          <input
            className="input quantity-input"
            name="points"
            type="number"
            required
            placeholder="Points"
          />
          <input
            className="input"
            name="reason"
            required
            minLength={3}
            placeholder="Mandatory reason"
          />
          <button className="button" disabled={pending}>
            Adjust
          </button>
        </form>
      )}
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {customer.loyaltyTransactions.map((entry) => (
              <tr key={entry.id}>
                <td>
                  {new Date(entry.occurredAt).toLocaleDateString("en-BD")}
                </td>
                <td>{entry.type}</td>
                <td>{entry.reason}</td>
                <td>{entry.points > 0 ? `+${entry.points}` : entry.points}</td>
              </tr>
            ))}
            {!customer.loyaltyTransactions.length && (
              <tr>
                <td colSpan={4}>No loyalty activity yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
