export default function Loading() {
  return (
    <div aria-live="polite">
      <div className="eyebrow">Loading workspace</div>
      <h1>Preparing your view…</h1>
      <div className="cards">
        {[1, 2, 3, 4].map((item) => (
          <div
            className="card"
            style={{ minHeight: 130, opacity: 0.55 }}
            key={item}
          />
        ))}
      </div>
    </div>
  );
}
