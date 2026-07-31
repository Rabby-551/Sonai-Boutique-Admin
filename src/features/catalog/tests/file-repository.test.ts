import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { CatalogFileStore } from "../data/file-store";
import { FileCatalogRepository } from "../data/file-repository";

const directories: string[] = [];
async function repository() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "shonai-catalog-"));
  directories.push(directory);
  return {
    directory,
    repository: new FileCatalogRepository(new CatalogFileStore(directory)),
  };
}
afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("file catalog repository", () => {
  it("persists creation across repository instances", async () => {
    const { directory, repository: first } = await repository();
    const category = (await first.listCategories())[0];
    const created = await first.createProduct({
      name: "Test Product",
      description: "A complete test catalog product.",
      categoryId: category.id,
      priceMinor: 20_000,
      costMinor: 10_000,
      lowStockThreshold: 2,
      tags: [],
      status: "draft",
      images: [],
      variants: [
        {
          id: "v1",
          sku: "TEST-001",
          color: "Blue",
          size: "Free",
          priceMinor: null,
          barcode: "TEST001",
          active: true,
        },
      ],
    });
    const second = new FileCatalogRepository(new CatalogFileStore(directory));
    expect((await second.getProduct(created.id))?.name).toBe("Test Product");
    expect(
      JSON.parse(await readFile(path.join(directory, "shonai.json"), "utf8")),
    ).toBeTruthy();
  });
  it("rejects stale versions", async () => {
    const { repository: repo } = await repository();
    const product = (await repo.listProducts({})).items[0];
    await repo.updateProduct(product.id, {
      ...product,
      name: "First edit",
      version: product.version,
    });
    await expect(
      repo.updateProduct(product.id, {
        ...product,
        name: "Stale edit",
        version: product.version,
      }),
    ).rejects.toThrow(/changed/);
  });
  it("rejects a barcode already assigned to another variant", async () => {
    const { repository: repo } = await repository();
    const product = (await repo.listProducts({})).items[0];
    const category = (await repo.listCategories())[0];
    await expect(
      repo.createProduct({
        ...product,
        name: "Duplicate barcode product",
        categoryId: category.id,
        version: undefined,
        variants: [
          {
            ...product.variants[0],
            id: "duplicate-barcode-variant",
            sku: "UNIQUE-SKU-001",
          },
        ],
      }),
    ).rejects.toThrow(/barcode/);
  });
  it("protects categories used by active products", async () => {
    const { repository: repo } = await repository();
    const product = (await repo.listProducts({})).items[0];
    const category = (await repo.listCategories()).find(
      (item) => item.id === product.categoryId,
    )!;
    await expect(
      repo.archiveCategory(category.id, category.version),
    ).rejects.toThrow(/active products/);
  });
  it("reports a malformed persistent store without replacing it", async () => {
    const { directory, repository: repo } = await repository();
    await writeFile(
      path.join(directory, "catalog.json"),
      '{"products":[]}',
      "utf8",
    );

    await expect(repo.listProducts({})).rejects.toThrow(/malformed/);
    expect(await readFile(path.join(directory, "catalog.json"), "utf8")).toBe(
      '{"products":[]}',
    );
  });
});
