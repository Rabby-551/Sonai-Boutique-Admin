"use client";
import { useActionState } from "react";
import { saveCategoryAction } from "../server/actions";
import { initialCatalogActionState } from "../server/action-state";
import type { Category } from "../schemas/catalog";

export function CategoryCreateForm({
  categories,
}: {
  categories: readonly Category[];
}) {
  const [state, action, pending] = useActionState(
    saveCategoryAction,
    initialCatalogActionState,
  );
  return (
    <form action={action} className="card catalog-form">
      <div className="section-title">
        <div>
          <div className="eyebrow">New taxonomy</div>
          <h2>Add category</h2>
        </div>
      </div>
      {state.message && (
        <div className={`form-message ${state.status}`} role="status">
          {state.message}
        </div>
      )}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="new-category-name">Name</label>
          <input
            className="input"
            id="new-category-name"
            name="name"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="new-category-parent">Parent category</label>
          <select className="select" id="new-category-parent" name="parentId">
            <option value="">None</option>
            {categories
              .filter((item) => item.status === "active")
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="new-category-order">Display order</label>
          <input
            className="input"
            defaultValue="0"
            id="new-category-order"
            min="0"
            name="displayOrder"
            type="number"
          />
        </div>
        <input name="status" type="hidden" value="active" />
      </div>
      <button className="button" disabled={pending} type="submit">
        {pending ? "Adding…" : "Add category"}
      </button>
    </form>
  );
}
