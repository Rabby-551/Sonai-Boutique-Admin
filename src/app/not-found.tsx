import Link from "next/link";
export default function NotFound() {
  return (
    <main className="content">
      <div className="card empty" role="status">
        <h1>Page not found</h1>
        <p>
          The requested admin resource does not exist or is no longer available.
        </p>
        <Link className="button" href="/dashboard">
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}
