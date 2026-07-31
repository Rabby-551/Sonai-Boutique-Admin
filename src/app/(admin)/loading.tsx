export default function Loading() {
  return (
    <div
      className="loading-workspace"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">The requested admin view is loading.</span>
      <div>
        <div
          className="skeleton"
          style={{ width: 140, height: 12, borderRadius: 6 }}
          aria-hidden
        />
        <div
          className="skeleton loading-heading"
          style={{ marginTop: 14 }}
          aria-hidden
        />
      </div>
      <div className="cards">
        {[1, 2, 3, 4].map((item) => (
          <div className="skeleton loading-card" aria-hidden key={item} />
        ))}
      </div>
      <div
        className="skeleton loading-card"
        style={{ minHeight: 320 }}
        aria-hidden
      />
    </div>
  );
}
