import Link from "next/link";
export default function LoginPage() {
  return (
    <main className="login-wrap">
      <section className="login-art">
        <div className="eyebrow" style={{ color: "var(--gold)" }}>
          Shonai Boutique
        </div>
        <h1 style={{ maxWidth: 540, fontSize: 56 }}>
          Calm control for every branch, order and piece.
        </h1>
        <p style={{ maxWidth: 520, lineHeight: 1.7, color: "#ddd8ce" }}>
          A single operations workspace for the people who curate, fulfill and
          grow Shonai.
        </p>
      </section>
      <section className="login-card">
        <div
          className="brand"
          style={{ color: "var(--charcoal)", paddingLeft: 0 }}
        >
          <div className="brand-mark">S</div>
          <div>
            <strong>Welcome back</strong>
            <small>Secure staff access</small>
          </div>
        </div>
        <form>
          <div className="field">
            <label htmlFor="email">Work email</label>
            <input
              className="input"
              id="email"
              type="email"
              defaultValue="owner@shonai.test"
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              className="input"
              id="password"
              type="password"
              defaultValue="mock-password"
              autoComplete="current-password"
            />
          </div>
          <Link className="button" style={{ width: "100%" }} href="/dashboard">
            Sign in to workspace
          </Link>
        </form>
        <p className="notice" style={{ marginTop: 24 }}>
          Mock authentication is active. Credentials are illustrative and no
          real password is stored.
        </p>
      </section>
    </main>
  );
}
