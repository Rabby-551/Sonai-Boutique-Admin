"use client";

import { useActionState } from "react";
import type { HomepageRecord } from "../schemas/website";
import { initialWebsiteActionState } from "../server/action-state";
import { updateHomepageAction } from "../server/actions";

export function HomepageForm({
  record,
  editable,
}: {
  record: HomepageRecord;
  editable: boolean;
}) {
  const [state, action, pending] = useActionState(
    updateHomepageAction,
    initialWebsiteActionState,
  );
  const language = record.locale === "en" ? "English" : "বাংলা";

  return (
    <form action={action} className="catalog-form">
      <input type="hidden" name="locale" value={record.locale} />
      <input type="hidden" name="expectedVersion" value={record.version} />
      <fieldset className="settings-fieldset" disabled={!editable || pending}>
        <section className="form-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{language} storefront</span>
              <h2>Homepage content</h2>
              <p className="muted">
                Version {record.version} · {record.status}
              </p>
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor={`${record.locale}-heroTitle`}>Hero title</label>
              <input
                className="input"
                id={`${record.locale}-heroTitle`}
                name="heroTitle"
                required
                defaultValue={record.content.heroTitle}
              />
            </div>
            <div className="field">
              <label htmlFor={`${record.locale}-heroSubtitle`}>
                Hero subtitle
              </label>
              <input
                className="input"
                id={`${record.locale}-heroSubtitle`}
                name="heroSubtitle"
                required
                defaultValue={record.content.heroSubtitle}
              />
            </div>
            <div className="field">
              <label htmlFor={`${record.locale}-heroCtaLabel`}>
                Button label
              </label>
              <input
                className="input"
                id={`${record.locale}-heroCtaLabel`}
                name="heroCtaLabel"
                required
                defaultValue={record.content.heroCtaLabel}
              />
            </div>
            <div className="field">
              <label htmlFor={`${record.locale}-heroHref`}>
                Button destination
              </label>
              <input
                className="input"
                id={`${record.locale}-heroHref`}
                name="heroHref"
                required
                defaultValue={record.content.heroHref}
              />
            </div>
            <div className="field">
              <label htmlFor={`${record.locale}-heroImage`}>
                Hero artwork path
              </label>
              <input
                className="input"
                id={`${record.locale}-heroImage`}
                name="heroImage"
                required
                defaultValue={record.content.heroImage}
              />
            </div>
            <div className="field">
              <label htmlFor={`${record.locale}-heroAlt`}>
                Artwork description
              </label>
              <input
                className="input"
                id={`${record.locale}-heroAlt`}
                name="heroAlt"
                required
                defaultValue={record.content.heroAlt}
              />
            </div>
            <div className="field">
              <label htmlFor={`${record.locale}-newArrivalsTitle`}>
                New arrivals heading
              </label>
              <input
                className="input"
                id={`${record.locale}-newArrivalsTitle`}
                name="newArrivalsTitle"
                required
                defaultValue={record.content.newArrivalsTitle}
              />
            </div>
            <div className="field">
              <label htmlFor={`${record.locale}-trendingTitle`}>
                Trending heading
              </label>
              <input
                className="input"
                id={`${record.locale}-trendingTitle`}
                name="trendingTitle"
                required
                defaultValue={record.content.trendingTitle}
              />
            </div>
            <div className="field">
              <label htmlFor={`${record.locale}-status`}>
                Publishing status
              </label>
              <select
                className="select"
                id={`${record.locale}-status`}
                name="status"
                defaultValue={record.status}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </section>
        {state.message ? (
          <p className={`form-message ${state.status}`} role="status">
            {state.message}
          </p>
        ) : null}
        <div className="form-footer">
          {editable ? (
            <button className="button" disabled={pending}>
              {pending ? "Saving…" : "Save homepage"}
            </button>
          ) : (
            <span className="muted">
              Content is read only for your role or data mode.
            </span>
          )}
        </div>
      </fieldset>
    </form>
  );
}
