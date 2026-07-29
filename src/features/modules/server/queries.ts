import "server-only";
import { requirePermission } from "@/lib/auth/session";
import { getModuleRepository } from "../data/repository-factory";
import { modules } from "../data/modules";

/** Loads a permitted module and returns a presentation-ready definition. */
export async function getModule(slug: string) {
  const definition = modules[slug];
  if (!definition) return null;
  await requirePermission(definition.permission);
  const rows = await getModuleRepository().list({ slug });
  return { ...definition, rows };
}
