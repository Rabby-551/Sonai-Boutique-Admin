"use client";

import Link from "next/link";
import { AlertTriangle, CircleAlert, Info } from "lucide-react";
import { useAdminLocale } from "@/components/i18n/admin-locale-provider";
import type { DashboardSummary } from "../schemas/dashboard-schema";
export function AttentionQueue({
  alerts,
}: {
  alerts: DashboardSummary["alerts"];
}) {
  const { locale, dictionary } = useAdminLocale();
  const copy = dictionary.dashboard;
  const icons = { critical: CircleAlert, warning: AlertTriangle, info: Info };
  const banglaAlerts: Record<string, { title: string; detail: string }> = {
    "alert-stock": {
      title: "৬টি গুরুতর স্টক সতর্কতা",
      detail: "আজই পুনরায় অর্ডার বা স্থানান্তর করুন",
    },
    "alert-orders": {
      title: "৮টি অর্ডার নিশ্চিতকরণের অপেক্ষায়",
      detail: "সবচেয়ে পুরোনোটি ৪২ মিনিট ধরে অপেক্ষায়",
    },
    "alert-counts": {
      title: "২টি স্টক গণনা পর্যালোচনা প্রয়োজন",
      detail: "মোট পার্থক্য ৩ ইউনিট",
    },
  };
  return (
    <section className="card">
      <div className="section-title">
        <div>
          <div className="eyebrow">{copy.attentionQueue}</div>
          <h2>{copy.needsAction}</h2>
        </div>
      </div>
      {alerts.length ? (
        alerts.map((alert) => {
          const Icon = icons[alert.severity];
          const localized =
            locale === "bn" ? banglaAlerts[alert.id] : undefined;
          return (
            <Link className="attention-item" href={alert.href} key={alert.id}>
              <Icon aria-hidden size={20} />
              <span>
                <strong>{localized?.title ?? alert.title}</strong>
                <small>{localized?.detail ?? alert.detail}</small>
              </span>
            </Link>
          );
        })
      ) : (
        <div className="empty-inline">{copy.noAlerts}</div>
      )}
    </section>
  );
}
