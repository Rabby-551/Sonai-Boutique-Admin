"use client";
import { useRef, useState } from "react";
import type { InventoryRow } from "../schemas/inventory";

export function ScannerInput({
  rows,
  onSelect,
}: {
  rows: readonly InventoryRow[];
  onSelect: (row: InventoryRow) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("Scanner ready.");
  const scan = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const row = rows.find((item) =>
      [item.sku, item.barcode].some((key) => key.toLowerCase() === normalized),
    );
    if (row) {
      onSelect(row);
      setMessage(`${row.sku} selected.`);
    } else setMessage("Barcode or SKU was not found.");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };
  return (
    <div className="scanner-box">
      <label htmlFor="scanner-input">Scan barcode or enter SKU</label>
      <input
        autoComplete="off"
        autoFocus
        className="input"
        id="scanner-input"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            scan(event.currentTarget.value);
          }
        }}
        ref={inputRef}
      />
      <span aria-live="polite" className="metric-label">
        {message}
      </span>
    </div>
  );
}
