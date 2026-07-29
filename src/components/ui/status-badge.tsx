export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone =
    /active|paid|delivered|resolved|received|present|healthy|approved/.test(
      normalized,
    )
      ? "success"
      : /low|pending|draft|transit|leave|scheduled|partial/.test(normalized)
        ? "warning"
        : /out|cancel|overdue|rejected|absent|critical/.test(normalized)
          ? "danger"
          : "";
  return <span className={`badge ${tone}`}>{status.replaceAll("_", " ")}</span>;
}
