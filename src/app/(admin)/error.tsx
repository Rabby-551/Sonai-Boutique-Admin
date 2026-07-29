"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card empty">
      <h1>We could not load this view</h1>
      <p>
        Try again. If the problem continues, share the time and page name with
        your administrator.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
