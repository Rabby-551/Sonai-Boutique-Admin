"use client";

import { Filter, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useTransition, type FormEvent } from "react";
import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { dashboardCopy } from "../dashboard-copy";
import type { DashboardQuery } from "../schemas/dashboard-schema";

interface Props {
  query: DashboardQuery;
  locale: AdminLocale;
}

function Fields({ query, locale }: Props) {
  const copy = dashboardCopy(locale);
  return (
    <>
      <label>
        {copy.location}
        <select name="branch" defaultValue={query.branch}>
          <option value="all">{copy.all}</option>
          <option value="rupnagar">Rupnagar</option>
          <option value="mirpur-2">Mirpur 2</option>
          <option value="online">Online</option>
        </select>
      </label>
      <label>
        {copy.channel}
        <select name="channel" defaultValue={query.channel}>
          <option value="all">{copy.all}</option>
          <option value="website">Website</option>
          <option value="pos">POS</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="branch">{copy.branch}</option>
          <option value="campaign">Campaign</option>
        </select>
      </label>
      <label>
        {copy.range}
        <select name="range" defaultValue={query.range}>
          <option value="today">{copy.today}</option>
          <option value="7d">{copy.days7}</option>
          <option value="30d">{copy.days30}</option>
          <option value="month">{copy.month}</option>
          <option value="quarter">{copy.quarter}</option>
          <option value="year">{copy.year}</option>
          <option value="custom">{copy.custom}</option>
        </select>
      </label>
      <label>
        {copy.from}
        <input name="from" type="date" defaultValue={query.from} />
      </label>
      <label>
        {copy.to}
        <input name="to" type="date" defaultValue={query.to} />
      </label>
      <label>
        {copy.granularity}
        <select name="granularity" defaultValue={query.granularity}>
          <option value="auto">{copy.auto}</option>
          <option value="day">{copy.day}</option>
          <option value="week">{copy.week}</option>
          <option value="month">{copy.monthly}</option>
          <option value="quarter">{copy.quarterly}</option>
        </select>
      </label>
      <label className="premium-check">
        <input
          name="compare"
          type="checkbox"
          value="true"
          defaultChecked={query.compare}
        />
        {copy.comparison}
      </label>
    </>
  );
}

export function PremiumDashboardFilters({ query, locale }: Props) {
  const copy = dashboardCopy(locale);
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const active = [
    query.branch !== "all",
    query.channel !== "all",
    query.range !== "30d",
    query.granularity !== "auto",
  ].filter(Boolean).length;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    values.forEach((value, key) => {
      if (String(value)) params.set(key, String(value));
    });
    startTransition(() => router.push(`/dashboard?${params}`));
    dialog.current?.close();
  };
  const actions = (
    <div className="premium-filter-actions">
      <a className="button secondary" href="/dashboard">
        {copy.reset}
      </a>
      <button className="button" disabled={pending} type="submit">
        {pending ? "…" : copy.apply}
      </button>
    </div>
  );
  return (
    <section className="premium-filter-shell" aria-label={copy.filters}>
      <div className="premium-filter-heading">
        <div>
          <strong>{copy.filters}</strong>
          <span>
            {active} {copy.activeFilters}
          </span>
        </div>
        <button
          className="button secondary premium-filter-open"
          type="button"
          onClick={() => dialog.current?.showModal()}
        >
          <Filter size={17} />
          {copy.openFilters}
        </button>
      </div>
      <form
        className="premium-filter-form premium-filter-desktop"
        onSubmit={submit}
      >
        <Fields query={query} locale={locale} />
        {actions}
      </form>
      <dialog className="premium-filter-drawer" ref={dialog}>
        <div className="premium-drawer-heading">
          <strong>{copy.filters}</strong>
          <button
            aria-label={copy.close}
            onClick={() => dialog.current?.close()}
            type="button"
          >
            <X />
          </button>
        </div>
        <form className="premium-filter-form" onSubmit={submit}>
          <Fields query={query} locale={locale} />
          {actions}
        </form>
      </dialog>
    </section>
  );
}
