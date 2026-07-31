import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import {
  createCorrelationId,
  logServerEvent,
} from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

async function checkConfiguredSource(): Promise<void> {
  if (env.DATA_SOURCE === "mock") {
    await new ShonaiFileStore().read();
    return;
  }
  // API-TODO: align this probe path and envelope with the production backend contract.
  const response = await fetch(`${env.API_BASE_URL}/health`, {
    cache: "no-store",
    signal: AbortSignal.timeout(3_000),
  });
  if (!response.ok) throw new Error("Upstream readiness failed");
}

/** Validates the configured data boundary without exposing store or upstream details. */
export async function GET() {
  const correlationId = createCorrelationId();
  try {
    await checkConfiguredSource();
    return NextResponse.json(
      { status: "ready", source: env.DATA_SOURCE, correlationId },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logServerEvent("error", "readiness_failed", {
      correlationId,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { status: "unavailable", correlationId },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
