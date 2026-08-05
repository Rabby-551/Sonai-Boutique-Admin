export function StatusBadge({
  status,
  label = status,
}: {
  status: string;
  label?: string;
}) {
  const normalized = status.toLowerCase();
  const tone =
    /active|paid|delivered|resolved|received|present|healthy|approved|ready|passed|completed|matched|strong|frozen/.test(
      normalized,
    )
      ? "success"
      : /low|medium|pending|draft|transit|leave|scheduled|partial|review|attention|paused|sandbox|identity|controlled/.test(
            normalized,
          )
        ? "warning"
        : /out|cancel|overdue|rejected|absent|critical|blocked|failed|mismatch|missing|duplicate|legal|external/.test(
              normalized,
            )
          ? "danger"
          : "";
  return <span className={`badge ${tone}`}>{label.replaceAll("_", " ")}</span>;
}
