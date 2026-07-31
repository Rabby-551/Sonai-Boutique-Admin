export default function DemoLoading() {
  return (
    <div className="stack" aria-busy="true" aria-label="Loading demo workspace">
      <div className="skeleton heading-skeleton" />
      <div className="metric-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="card skeleton metric-skeleton" key={index} />
        ))}
      </div>
      <div className="card skeleton table-skeleton" />
    </div>
  );
}
