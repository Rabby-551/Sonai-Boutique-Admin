"use client";
import { Printer } from "lucide-react";
export function PrintButton() {
  return (
    <button className="button" onClick={() => window.print()} type="button">
      <Printer size={16} />
      Print labels
    </button>
  );
}
