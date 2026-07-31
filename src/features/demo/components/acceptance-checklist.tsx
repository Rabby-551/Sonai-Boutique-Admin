"use client";
import { useMemo, useState } from "react";
import type { AcceptanceCheck } from "../schemas/demo";

export function AcceptanceChecklist({ checks }: { checks: AcceptanceCheck[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const completed = useMemo(() => new Set(selected), [selected]);
  const percent = Math.round((completed.size / checks.length) * 100);
  const toggle = (id: string, checked: boolean) => {
    setSelected((current) =>
      checked
        ? [...new Set([...current, id])]
        : current.filter((item) => item !== id),
    );
  };
  return (
    <section
      className="card acceptance-checklist"
      aria-labelledby="acceptance-checklist-title"
    >
      <div className="section-title compact">
        <div>
          <div className="eyebrow">Human decision</div>
          <h2 id="acceptance-checklist-title">
            Stakeholder sign-off rehearsal
          </h2>
        </div>
        <strong>{percent}% selected</strong>
      </div>
      <div className="progress" aria-hidden>
        <span style={{ width: `${percent}%` }} />
      </div>
      <p className="sr-only" aria-live="polite">
        {completed.size} of {checks.length} stakeholder checks selected.
      </p>
      <fieldset className="uat-checks">
        <legend className="sr-only">Stakeholder acceptance checks</legend>
        {checks.map((check) => (
          <label className="uat-check" key={check.id}>
            <input
              type="checkbox"
              checked={completed.has(check.id)}
              onChange={(event) => toggle(check.id, event.target.checked)}
            />
            <span>
              <strong>{check.label}</strong>
              <small>
                {check.owner} · {check.evidence}
              </small>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="notice">
        Selections stay in this browser session. They do not create durable
        approval or unlock production integration.
      </div>
    </section>
  );
}
