import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { catalogStoreSchema } from "@/features/catalog/schemas/catalog";
import { defaultRolePermissions } from "@/lib/auth/permissions";
import {
  createShonaiStore,
  migrateShonaiStoreV2,
  migrateShonaiStoreV3,
  migrateShonaiStoreV4,
} from "./fixtures";
import {
  shonaiStoreSchema,
  shonaiStoreV2Schema,
  shonaiStoreV3Schema,
  shonaiStoreV4Schema,
  type ShonaiStore,
} from "./schema";
import { OperationsError } from "@/lib/operations-error";

let operationQueue = Promise.resolve<unknown>(undefined);

const legacyLocationIds: Record<string, string> = {
  "loc-banani": "rupnagar",
  "loc-dhanmondi": "mirpur-shopping-center",
  "loc-rupnagar": "rupnagar",
  "loc-mirpur-2": "mirpur-shopping-center",
};

function normalizeLegacyLocationIds(value: unknown): unknown {
  if (typeof value === "string") return legacyLocationIds[value] ?? value;
  if (Array.isArray(value)) return value.map(normalizeLegacyLocationIds);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeLegacyLocationIds(item),
      ]),
    );
  }
  return value;
}

function upgradeCurrentStore(store: ShonaiStore) {
  const upgraded = structuredClone(store);
  let changed = false;

  for (const profile of upgraded.roleProfiles) {
    const defaults = defaultRolePermissions[profile.role];
    const shouldTrackDefaults =
      profile.role === "owner" || profile.updatedBy === "system";
    if (
      shouldTrackDefaults &&
      (profile.permissions.length !== defaults.length ||
        defaults.some(
          (permission) => !profile.permissions.includes(permission),
        ))
    ) {
      profile.permissions = [...defaults];
      profile.version += 1;
      profile.updatedAt = new Date().toISOString();
      changed = true;
    }
  }

  const locationNames = {
    rupnagar: "Rupnagar",
    "mirpur-shopping-center": "Mirpur 2",
    "loc-online": "Online",
  } as const;
  for (const location of upgraded.locations) {
    const name = locationNames[location.id as keyof typeof locationNames];
    if (name && location.name !== name) {
      location.name = name;
      changed = true;
    }
  }

  if (upgraded.businessSettings.businessName === "Shonai Boutique") {
    upgraded.businessSettings.businessName = "Sonai Boutique";
    changed = true;
  }
  if (
    upgraded.businessSettings.supportEmail === "support@shonai.example.test"
  ) {
    upgraded.businessSettings.supportEmail = "support@sonai.example.test";
    changed = true;
  }
  for (const staff of upgraded.staff) {
    if (staff.email?.endsWith("@shonai.example.test")) {
      staff.email = staff.email.replace(
        "@shonai.example.test",
        "@sonai.example.test",
      );
      changed = true;
    }
  }
  for (const account of upgraded.userAccounts) {
    if (account.username.endsWith("@shonai.example.test")) {
      account.username = account.username.replace(
        "@shonai.example.test",
        "@sonai.example.test",
      );
      changed = true;
    }
  }

  return { upgraded, changed };
}

export class ShonaiFileStore {
  readonly filePath: string;
  private readonly legacyPath: string;

  constructor(
    directory = process.env.MOCK_DATA_DIR ||
      path.join(process.cwd(), ".mock-data"),
  ) {
    this.filePath = path.join(directory, "shonai.json");
    this.legacyPath = path.join(directory, "catalog.json");
  }

  /** Reads a validated snapshot after all earlier mock transactions finish. */
  async read(): Promise<ShonaiStore> {
    const task = operationQueue.then(() => this.readUnlocked());
    operationQueue = task.catch(() => undefined);
    return structuredClone(await task);
  }

  /** Runs a whole-store read/modify/write transaction with atomic replacement. */
  async transaction<T>(
    mutate: (store: ShonaiStore) => T | Promise<T>,
  ): Promise<T> {
    const task = operationQueue.then(async () => {
      const store = await this.readUnlocked();
      const result = await mutate(store);
      await this.writeUnlocked(shonaiStoreSchema.parse(store));
      return structuredClone(result);
    });
    operationQueue = task.catch(() => undefined);
    return task;
  }

  /** Test and migration hook; normal feature code should prefer transaction(). */
  async write(store: ShonaiStore): Promise<void> {
    await this.transaction((current) => {
      Object.assign(current, shonaiStoreSchema.parse(store));
    });
  }

  private async readUnlocked(): Promise<ShonaiStore> {
    try {
      const raw: unknown = JSON.parse(await readFile(this.filePath, "utf8"));
      const serialized = JSON.stringify(raw);
      const hasLegacyLocationIds = Object.keys(legacyLocationIds).some((id) =>
        serialized.includes(`"${id}"`),
      );
      const normalized = hasLegacyLocationIds
        ? normalizeLegacyLocationIds(raw)
        : raw;
      if (
        typeof normalized === "object" &&
        normalized !== null &&
        "schemaVersion" in normalized &&
        normalized.schemaVersion === 2
      ) {
        const migrated = shonaiStoreSchema.parse(
          migrateShonaiStoreV4(
            migrateShonaiStoreV3(
              migrateShonaiStoreV2(shonaiStoreV2Schema.parse(normalized)),
            ),
          ),
        );
        await this.writeUnlocked(migrated);
        return migrated;
      }
      if (
        typeof normalized === "object" &&
        normalized !== null &&
        "schemaVersion" in normalized &&
        normalized.schemaVersion === 4
      ) {
        const migrated = shonaiStoreSchema.parse(
          migrateShonaiStoreV4(shonaiStoreV4Schema.parse(normalized)),
        );
        await this.writeUnlocked(migrated);
        return migrated;
      }
      if (
        typeof normalized === "object" &&
        normalized !== null &&
        "schemaVersion" in normalized &&
        normalized.schemaVersion === 3
      ) {
        const migrated = shonaiStoreSchema.parse(
          migrateShonaiStoreV4(
            migrateShonaiStoreV3(shonaiStoreV3Schema.parse(normalized)),
          ),
        );
        await this.writeUnlocked(migrated);
        return migrated;
      }
      const current = shonaiStoreSchema.parse(normalized);
      const upgrade = upgradeCurrentStore(current);
      if (hasLegacyLocationIds || upgrade.changed)
        await this.writeUnlocked(upgrade.upgraded);
      return upgrade.upgraded;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT")
        throw new OperationsError(
          "STORE_INVALID",
          "The persistent mock store is malformed; it was preserved for recovery.",
        );
    }

    let legacy;
    try {
      legacy = catalogStoreSchema.parse(
        JSON.parse(await readFile(this.legacyPath, "utf8")),
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT")
        throw new OperationsError(
          "STORE_INVALID",
          "The legacy catalog store is malformed; it was preserved for recovery.",
        );
    }
    const initialized = shonaiStoreSchema.parse(createShonaiStore(legacy));
    await this.writeUnlocked(initialized);
    return initialized;
  }

  private async writeUnlocked(store: ShonaiStore) {
    const directory = path.dirname(this.filePath);
    await mkdir(directory, { recursive: true });
    const temporary = `${this.filePath}.${randomUUID()}.tmp`;
    const serialized = `${JSON.stringify(store, null, 2)}\n`;
    await writeFile(temporary, serialized, "utf8");
    try {
      await rename(temporary, this.filePath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      // Multiple Next.js build workers can initialize the same canonical fixture.
      // Accept only a byte-identical winner; all real write conflicts still fail.
      if (
        ["EEXIST", "EPERM"].includes(code ?? "") &&
        (await readFile(this.filePath, "utf8").catch(() => "")) === serialized
      ) {
        await rm(temporary, { force: true });
        return;
      }
      throw error;
    }
  }
}
