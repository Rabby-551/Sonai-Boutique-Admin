import { Search } from "lucide-react";
import type { ModuleDefinition } from "@/features/modules/types";
import { StatusBadge } from "./status-badge";

export function ModuleTable({ module }: { module: ModuleDefinition }) {
  return (
    <section className="card table-card" aria-label={`${module.title} records`}>
      <div style={{ padding: 16 }} className="toolbar">
        <label style={{ position: "relative", flex: 1 }}>
          <span className="sr-only">Search {module.title}</span>
          <Search
            aria-hidden
            size={17}
            style={{ position: "absolute", left: 13, top: 13 }}
          />
          <input
            className="input"
            style={{ paddingLeft: 40, width: "100%" }}
            placeholder={`Search ${module.title.toLowerCase()}...`}
          />
        </label>
        <select className="select" aria-label="Filter status">
          <option>All statuses</option>
          <option>Active</option>
          <option>Pending</option>
        </select>
        <select className="select" aria-label="Filter location">
          <option>All locations</option>
          <option>Banani</option>
          <option>Dhanmondi</option>
          <option>Online</option>
        </select>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {module.columns.map((column) => (
                <th scope="col" key={column.key}>
                  {column.label}
                </th>
              ))}
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {module.rows.map((row) => (
              <tr key={String(row.id)}>
                {module.columns.map((column) => (
                  <td key={column.key}>
                    {column.key === "status" ? (
                      <StatusBadge status={String(row[column.key])} />
                    ) : (
                      String(row[column.key] ?? "—")
                    )}
                  </td>
                ))}
                <td>
                  <button
                    className="button secondary"
                    aria-label={`Open ${String(row.id)}`}
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: 16, color: "var(--muted)", fontSize: 13 }}>
        Showing {module.rows.length} deterministic mock records · Filters will
        remain shareable through URL parameters.
      </div>
    </section>
  );
}
