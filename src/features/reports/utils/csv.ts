import type { ReportResult } from "../schemas/reports";
const cell = (value: string | number) => {
  const text = String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
};
/** Serializes a report as UTF-8 CSV while neutralizing spreadsheet formula injection. */
export function reportToCsv(report: ReportResult) {
  const headers = report.columns.map((column) => cell(column.label)).join(",");
  const rows = report.rows.map((row) =>
    report.columns.map((column) => cell(row[column.key] ?? "")).join(","),
  );
  return `\uFEFF${[headers, ...rows].join("\r\n")}\r\n`;
}
