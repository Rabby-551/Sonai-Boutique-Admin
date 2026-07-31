"use client";
import { useActionState } from "react";
import type { CustomerSummary } from "@/features/customers/data/repository";
import type { Order } from "@/features/orders/schemas/orders";
import { createComplaintAction } from "../server/actions";
import { initialComplaintActionState } from "../server/action-state";
export function ComplaintForm({
  customers,
  orders,
}: {
  customers: readonly CustomerSummary[];
  orders: readonly Order[];
}) {
  const [state, action, pending] = useActionState(
    createComplaintAction,
    initialComplaintActionState,
  );
  return (
    <form action={action} className="catalog-form">
      <section className="form-section">
        <div className="form-grid three">
          <div className="field">
            <label htmlFor="customerId">Customer</label>
            <select
              className="select"
              id="customerId"
              name="customerId"
              required
            >
              <option value="">Select customer</option>
              {customers.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name} · {item.phone}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="orderId">Related order</label>
            <select className="select" id="orderId" name="orderId">
              <option value="">No order</option>
              {orders.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.orderNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="type">Type</label>
            <select className="select" id="type" name="type">
              <option value="complaint">Complaint</option>
              <option value="query">Query</option>
              <option value="support_request">Support request</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select className="select" id="category" name="category">
              {[
                "product_quality",
                "delivery",
                "payment",
                "return",
                "staff",
                "other",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="priority">Priority</label>
            <select
              className="select"
              id="priority"
              name="priority"
              defaultValue="normal"
            >
              {["low", "normal", "high", "urgent"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="source">Source</label>
            <select className="select" id="source" name="source">
              {["phone", "email", "whatsapp", "messenger", "branch"].map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
          </div>
          <div className="field">
            <label htmlFor="locationId">Branch</label>
            <select className="select" id="locationId" name="locationId">
              <option value="">Shared/online</option>
              <option value="rupnagar">Rupnagar</option>
              <option value="mirpur-shopping-center">Mirpur 2</option>
              <option value="loc-online">Online</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="dueAt">Due date</label>
            <input
              className="input"
              id="dueAt"
              name="dueAt"
              type="datetime-local"
            />
          </div>
          <div className="field full">
            <label htmlFor="description">Description</label>
            <textarea
              className="textarea"
              id="description"
              name="description"
              rows={5}
              minLength={10}
              required
            />
          </div>
        </div>
      </section>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <button className="button" disabled={pending}>
        Log complaint
      </button>
    </form>
  );
}
