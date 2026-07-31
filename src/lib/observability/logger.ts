import { randomUUID } from "node:crypto";

type LogLevel = "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

const sensitiveKey =
  /password|passcode|token|secret|authorization|cookie|card|account|phone|email|credential/i;

function sanitize(value: unknown, key = ""): unknown {
  if (sensitiveKey.test(key)) return "[REDACTED]";
  if (Array.isArray(value)) return value.map((item) => sanitize(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        sanitize(childValue, childKey),
      ]),
    );
  }
  return value;
}

export function createCorrelationId(): string {
  return randomUUID();
}

/** Writes a structured, recursively redacted server log record. */
export function logServerEvent(
  level: LogLevel,
  event: string,
  context: LogContext = {},
): void {
  const safeContext = sanitize(context) as LogContext;
  const record = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...safeContext,
  });
  const writer =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.info;
  writer(record);
}
