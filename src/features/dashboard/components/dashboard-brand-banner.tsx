import Image from "next/image";
import { adminDictionaries, type AdminLocale } from "@/lib/i18n/admin-locale";

export function DashboardBrandBanner({
  locale = "en",
}: {
  locale?: AdminLocale;
}) {
  const copy = adminDictionaries[locale].dashboard;
  return (
    <section className="dashboard-brand-banner" aria-label={copy.brandAria}>
      <Image
        alt={copy.brandArtworkAlt}
        className="dashboard-brand-artwork"
        fill
        priority
        sizes="(max-width: 800px) 100vw, calc(100vw - 272px)"
        src="/assets/sonai/editorial/campaign-home-atelier-desktop-v1.png"
      />
      <div className="dashboard-brand-copy">
        <span className="eyebrow">{copy.brandEyebrow}</span>
        <h2>{copy.brandTitle}</h2>
        <p>{copy.brandDescription}</p>
      </div>
    </section>
  );
}
