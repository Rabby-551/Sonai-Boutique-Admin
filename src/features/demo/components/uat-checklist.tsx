"use client";
import { useMemo, useState } from "react";
import type { DemoCheck } from "../schemas/demo";

export function UatChecklist({ checks }: { checks: DemoCheck[] }) {
  const automatic = checks
    .filter((item) => item.status === "passed")
    .map((item) => item.id);
  const [reviewed, setReviewed] = useState<string[]>(automatic);
  const completed = useMemo(() => new Set(reviewed), [reviewed]);
  const percent = Math.round((completed.size / checks.length) * 100);

  const toggle = (id: string, checked: boolean) => {
    setReviewed((current) =>
      checked
        ? [...new Set([...current, id])]
        : current.filter((item) => item !== id),
    );
  };

  return (
    <section className="card uat-panel" aria-labelledby="uat-title">
      <div className="section-title compact">
        <div>
          <div className="eyebrow">Browser-local review</div>
          <h2 id="uat-title">Staff UAT checklist</h2>
        </div>
        <strong>{percent}% reviewed</strong>
      </div>
      <div className="progress" aria-hidden>
        <span style={{ width: `${percent}%` }} />
      </div>
      <p className="sr-only" aria-live="polite">
        {completed.size} of {checks.length} checks reviewed.
      </p>
      <fieldset className="uat-checks">
        <legend className="sr-only">Demo release checks</legend>
        {checks.map((check) => (
          <label className="uat-check" key={check.id}>
            <input
              type="checkbox"
              checked={completed.has(check.id)}
              disabled={check.method === "automated"}
              onChange={(event) => toggle(check.id, event.target.checked)}
            />
            <span>
              <strong>{check.label}</strong>
              <small>
                {check.area} · {check.method} · {check.evidence}
              </small>
            </span>
          </label>
        ))}
      </fieldset>
      <p className="help-text">
        Manual selections are intentionally local to this browser and are not
        production sign-off.
      </p>
    </section>
  );
}
