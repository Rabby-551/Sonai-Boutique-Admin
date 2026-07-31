import Image from "next/image";

export function LoginShowcase() {
  return (
    <section className="login-art">
      <Image
        alt=""
        aria-hidden
        className="login-artwork"
        fill
        priority
        sizes="(max-width: 900px) 0px, 58vw"
        src="/assets/sonai/editorial/campaign-home-atelier-desktop-v1.png"
      />
      <div className="login-art-shade" />
      <div className="login-art-copy">
        <Image
          alt="Sonai Boutique"
          className="login-logo"
          height={108}
          priority
          src="/assets/sonai/logos/sonai-logo-transparent.png"
          width={108}
        />
        <div className="eyebrow">Sonai Boutique</div>
        <h1>Calm control for every branch, order and piece.</h1>
        <p>
          A single operations workspace for the people who curate, fulfill and
          grow Sonai.
        </p>
      </div>
    </section>
  );
}
