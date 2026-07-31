import Image from "next/image";

export function DashboardBrandBanner() {
  return (
    <section
      className="dashboard-brand-banner"
      aria-label="Sonai Boutique operations"
    >
      <Image
        alt="Sonai Boutique saree and three-piece campaign"
        className="dashboard-brand-artwork"
        fill
        priority
        sizes="(max-width: 800px) 100vw, calc(100vw - 272px)"
        src="/assets/sonai/editorial/campaign-home-atelier-desktop-v1.png"
      />
      <div className="dashboard-brand-copy">
        <span className="eyebrow">One Sonai workspace</span>
        <h2>Website, branches and atelier operations in one view.</h2>
        <p>
          Publish the collection, protect stock, fulfil every order and keep the
          customer promise consistent across every Sonai channel.
        </p>
      </div>
    </section>
  );
}
