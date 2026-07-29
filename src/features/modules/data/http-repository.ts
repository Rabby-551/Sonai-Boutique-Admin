import "server-only";
import { env } from "@/lib/env";
import { moduleListSchema } from "../schemas/module-schema";
import type { ModuleListInput, ModuleRepository } from "./repository";

export class HttpModuleRepository implements ModuleRepository {
  async list(input: ModuleListInput) {
    const params = new URLSearchParams({
      ...(input.query ? { query: input.query } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.branch ? { branch: input.branch } : {}),
    });
    const response = await fetch(
      `${env.API_BASE_URL}/${input.slug}?${params}`,
      { cache: "no-store" },
    );
    if (!response.ok) throw new Error(`MODULE_LIST_FAILED:${response.status}`);
    return moduleListSchema.parse(await response.json());
  }
}
