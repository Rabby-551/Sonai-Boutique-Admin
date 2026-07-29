import { moduleListSchema } from "../schemas/module-schema";
import { modules } from "./modules";
import type { ModuleListInput, ModuleRepository } from "./repository";

export class MockModuleRepository implements ModuleRepository {
  async list(input: ModuleListInput) {
    const definition = modules[input.slug];
    if (!definition) return [];
    // Parsing mocks catches fixture drift before presentation code can depend on it.
    return moduleListSchema.parse(definition.rows);
  }
}
