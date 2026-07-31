"use client";

import { useEffect, useRef } from "react";

export default function GlobalError({ reset }: { reset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <html lang="en">
      <body>
        <main className="content">
          <div className="card empty" role="alert">
            <h1 ref={headingRef} tabIndex={-1}>
              The admin workspace stopped unexpectedly
            </h1>
            <p>No changes should be retried until this page recovers.</p>
            <button className="button" onClick={reset}>
              Reload workspace
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
