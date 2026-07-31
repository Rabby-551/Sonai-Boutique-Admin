import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Dependency-free liveness probe for process and router availability. */
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "shonai-admin",
      timestamp: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
