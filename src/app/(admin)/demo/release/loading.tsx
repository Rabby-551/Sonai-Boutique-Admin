export default function PreviewReleaseLoading() {
  return (
    <div
      className="stack"
      aria-busy="true"
      aria-label="Loading preview release evidence"
    >
      <div className="skeleton heading-skeleton" />
      <div className="grid-2 balanced">
        <div className="card skeleton metric-skeleton" />
        <div className="card skeleton metric-skeleton" />
      </div>
      <div className="card skeleton table-skeleton" />
    </div>
  );
}
