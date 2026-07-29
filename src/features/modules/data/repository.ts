import type { ModuleRow } from "../schemas/module-schema";

export interface ModuleListInput {
  slug: string;
  query?: string;
  status?: string;
  branch?: string;
}

/** Stable data boundary shared by mock and future HTTP module adapters. */
export interface ModuleRepository {
  list(input: ModuleListInput): Promise<readonly ModuleRow[]>;
}
