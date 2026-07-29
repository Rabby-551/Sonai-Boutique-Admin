"use client";
import { useActionState, useMemo, useState } from "react";
import { FileUp } from "lucide-react";
import { importProductsAction } from "../server/actions";
import { initialCatalogActionState } from "../server/action-state";
import { parseCatalogCsv } from "../utils/csv";

export function CsvImporter({
  existingSkus,
}: {
  existingSkus: readonly string[];
}) {
  const [state, action, pending] = useActionState(
    importProductsAction,
    initialCatalogActionState,
  );
  const [text, setText] = useState("");
  const preview = useMemo(
    () => (text ? parseCatalogCsv(text, existingSkus) : null),
    [existingSkus, text],
  );
  const validRows =
    preview?.rows.flatMap((row) => (row.value ? [row.value] : [])) ?? [];
  const readFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 5_000_000) {
      setText("");
      return;
    }
    setText(await file.text());
  };
  return (
    <>
      <section className="card">
        <div className="section-title">
          <div>
            <div className="eyebrow">CSV intake</div>
            <h2>Upload and validate</h2>
            <p className="subtitle">
              Required headers: name, sku, category, price, cost, color, size,
              stock, status.
            </p>
          </div>
          <label className="button">
            <FileUp size={17} />
            Choose CSV
            <input
              accept=".csv,text/csv"
              hidden
              onChange={(event) => readFile(event.target.files?.[0])}
              type="file"
            />
          </label>
        </div>
      </section>
      {preview && (
        <form
          action={action}
          className="card table-card"
          style={{ marginTop: 20 }}
        >
          <input name="rows" type="hidden" value={JSON.stringify(validRows)} />
          <div className="import-summary">
            <strong>{validRows.length} valid rows</strong>
            <span>
              {preview.rows.length - validRows.length} rows need correction
            </span>
            <button
              className="button"
              disabled={!validRows.length || pending}
              type="submit"
            >
              {pending ? "Importing…" : "Import valid rows"}
            </button>
          </div>
          {state.message && (
            <div className={`form-message ${state.status}`} role="status">
              {state.message}
            </div>
          )}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={row.rowNumber}>
                    <td>{row.rowNumber}</td>
                    <td>{row.value?.name ?? "—"}</td>
                    <td>{row.value?.sku ?? "—"}</td>
                    <td>{row.value?.category ?? "—"}</td>
                    <td>
                      {row.value
                        ? `৳${(row.value.priceMinor / 100).toLocaleString("en-BD")}`
                        : "—"}
                    </td>
                    <td>
                      {row.errors.length ? (
                        <ul className="error-list">
                          {row.errors.map((error) => (
                            <li key={error}>{error}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="badge success">Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      )}
    </>
  );
}
