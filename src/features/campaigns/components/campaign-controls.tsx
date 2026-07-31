"use client";
import { useState, useTransition } from "react";
import type { Campaign } from "../schemas/campaigns";
import { transitionCampaignAction } from "../server/actions";
const nextByStatus: Record<Campaign["status"], Campaign["status"][]> = {
  draft: ["scheduled", "archived"],
  scheduled: ["active", "paused", "ended"],
  active: ["paused", "ended"],
  paused: ["active", "ended"],
  ended: ["archived"],
  archived: [],
};
export function CampaignControls({ campaign }: { campaign: Campaign }) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  return (
    <section className="card detail-panel stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Workflow</span>
          <h2>Campaign controls</h2>
        </div>
      </div>
      <div className="button-group">
        {nextByStatus[campaign.status].map((next) => (
          <button
            className="button secondary"
            disabled={pending}
            key={next}
            onClick={() =>
              start(async () => {
                const result = await transitionCampaignAction(
                  campaign.id,
                  next,
                  campaign.version,
                );
                setMessage(result.message);
              })
            }
          >
            Mark {next.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
