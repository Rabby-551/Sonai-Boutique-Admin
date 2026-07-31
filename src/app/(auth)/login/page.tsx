import Image from "next/image";
import { LoginShowcase } from "@/components/brand/login-showcase";
import { env } from "@/lib/env";
import { signInAction } from "./actions";
import { loginErrorMessages } from "./login-copy";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const mock = env.AUTH_SOURCE === "mock";
  return (
    <main className="login-wrap">
      <LoginShowcase />
      <section className="login-card">
        <div className="login-brand">
          <Image
            alt="Sonai Boutique"
            className="login-card-logo"
            height={62}
            src="/assets/sonai/logos/sonai-logo-transparent.png"
            width={62}
          />
          <div>
            <strong>Welcome back</strong>
            <small>Secure staff access</small>
          </div>
        </div>
        <form action={signInAction}>
          <div className="field">
            <label htmlFor="email">Work email</label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              defaultValue={mock ? "owner@sonai.test" : undefined}
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              className="input"
              id="password"
              name="password"
              type="password"
              defaultValue={mock ? "mock-password" : undefined}
              autoComplete="current-password"
              required
            />
          </div>
          {error ? (
            <p className="login-error" role="alert">
              {loginErrorMessages[error] ??
                "Unable to sign in. Please try again."}
            </p>
          ) : null}
          <button className="button" style={{ width: "100%" }} type="submit">
            Sign in to workspace
          </button>
        </form>
        <p className="notice" style={{ marginTop: 24 }}>
          {mock
            ? "Mock authentication is active. Credentials are illustrative and no real password is stored."
            : "Secure Sonai staff authentication is active. Access is limited by the role approved for your account."}
        </p>
      </section>
    </main>
  );
}
