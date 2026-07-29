import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { catalogStoreSchema, type CatalogStore } from "../schemas/catalog";
import { initialCatalogStore } from "./fixtures";
import { CatalogError } from "./catalog-errors";

let writeQueue = Promise.resolve();

export class CatalogFileStore {
  private readonly filePath: string;
  constructor(
    directory = process.env.MOCK_DATA_DIR ||
      path.join(process.cwd(), ".mock-data"),
  ) {
    this.filePath = path.join(directory, "catalog.json");
  }

  /** Initializes deterministic fixtures only when no development store exists. */
  async read(): Promise<CatalogStore> {
    try {
      return catalogStoreSchema.parse(
        JSON.parse(await readFile(this.filePath, "utf8")),
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        await this.write(initialCatalogStore);
        return structuredClone(initialCatalogStore);
      }
      if (error instanceof Error && error.name === "ZodError")
        throw new CatalogError(
          "STORE_INVALID",
          "The mock catalog store is malformed.",
        );
      throw error;
    }
  }

  /** Serializes and atomically renames writes so concurrent actions cannot leave partial JSON. */
  async write(store: CatalogStore): Promise<void> {
    const parsed = catalogStoreSchema.parse(store);
    const task = writeQueue.then(async () => {
      const directory = path.dirname(this.filePath);
      await mkdir(directory, { recursive: true });
      const temporary = `${this.filePath}.${randomUUID()}.tmp`;
      await writeFile(
        temporary,
        `${JSON.stringify(parsed, null, 2)}\n`,
        "utf8",
      );
      await rename(temporary, this.filePath);
    });
    writeQueue = task.catch(() => undefined);
    await task;
  }
}
