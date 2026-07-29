"use client";
import { useActionState } from "react";
import { archiveCategoryAction, saveCategoryAction } from "../server/actions";
import { initialCatalogActionState } from "../server/action-state";
import type { Category } from "../schemas/catalog";

export function CategoryRow({
  category,
  categories,
  productCount,
  canManage,
}: {
  category: Category;
  categories: readonly Category[];
  productCount: number;
  canManage: boolean;
}) {
  const [state, action, pending] = useActionState(
    saveCategoryAction,
    initialCatalogActionState,
  );
  const [archiveState, archiveAction, archivePending] = useActionState(
    async () => archiveCategoryAction(category.id, category.version),
    initialCatalogActionState,
  );
  if (!canManage)
    return (
      <tr>
        <td>
          <strong>{category.name}</strong>
        </td>
        <td>
          {categories.find((item) => item.id === category.parentId)?.name ??
            "—"}
        </td>
        <td>{productCount}</td>
        <td>{category.displayOrder}</td>
        <td>{category.status}</td>
      </tr>
    );
  return (
    <tr>
      <td colSpan={5}>
        <form action={action} className="category-row">
          <input name="id" type="hidden" value={category.id} />
          <input name="version" type="hidden" value={category.version} />
          <div className="field compact">
            <label htmlFor={`name-${category.id}`}>Name</label>
            <input
              className="input"
              id={`name-${category.id}`}
              name="name"
              required
              defaultValue={category.name}
            />
          </div>
          <div className="field compact">
            <label htmlFor={`parent-${category.id}`}>Parent</label>
            <select
              className="select"
              id={`parent-${category.id}`}
              name="parentId"
              defaultValue={category.parentId ?? ""}
            >
              <option value="">None</option>
              {categories
                .filter(
                  (item) => item.id !== category.id && item.status === "active",
                )
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="field compact">
            <label htmlFor={`order-${category.id}`}>Order</label>
            <input
              className="input"
              id={`order-${category.id}`}
              min="0"
              name="displayOrder"
              type="number"
              defaultValue={category.displayOrder}
            />
          </div>
          <div className="field compact">
            <label htmlFor={`status-${category.id}`}>Status</label>
            <select
              className="select"
              id={`status-${category.id}`}
              name="status"
              defaultValue={category.status}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="category-actions">
            <span className="metric-label">{productCount} products</span>
            <button
              className="button secondary"
              disabled={pending}
              type="submit"
            >
              Save
            </button>
            <button
              className="button danger"
              disabled={archivePending}
              formAction={archiveAction}
              onClick={(event) => {
                if (
                  !window.confirm(
                    `Archive ${category.name}? Active products must be moved first.`,
                  )
                )
                  event.preventDefault();
              }}
              type="submit"
            >
              Archive
            </button>
          </div>
          {(state.message || archiveState.message) && (
            <div
              className={`form-message ${state.status === "error" || archiveState.status === "error" ? "error" : "success"}`}
              role="status"
            >
              {state.message || archiveState.message}
            </div>
          )}
        </form>
      </td>
    </tr>
  );
}
