"use client";
import { useEffect, useRef } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const supportReference = error.digest?.slice(0, 16) || "local-error";

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="card empty" role="alert">
      <h1 ref={headingRef} tabIndex={-1}>
        We could not load this view
      </h1>
      <p>
        Try again. If the problem continues, share this safe support reference
        with your administrator: <code>{supportReference}</code>.
      </p>
      <div className="button-group" style={{ justifyContent: "center" }}>
        <button className="button" onClick={reset}>
          Try again
        </button>
        <a className="button secondary" href="/dashboard">
          Return to dashboard
        </a>
      </div>
    </div>
  );
}
