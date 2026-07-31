import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CsvImporter } from "../components/csv-importer";

vi.mock("../server/actions", () => ({
  importProductsAction: vi.fn(async () => ({
    status: "success",
    message: "Imported.",
  })),
}));

describe("CSV importer", () => {
  it("reads an uploaded UTF-8 file and displays mixed-row validation", async () => {
    const user = userEvent.setup();
    const { container } = render(<CsvImporter existingSkus={[]} />);
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    const csv = [
      "name,sku,category,price,cost,color,size,stock,status",
      "Imported Orna,TEST-IMPORT-1,Orna,1200,700,White,Free,3,draft",
      "Broken,TEST-IMPORT-1,Missing,10,20,Blue,Free,-1,wrong",
    ].join("\n");
    await user.upload(
      input!,
      new File([csv], "catalog.csv", { type: "text/csv" }),
    );
    expect(await screen.findByText("1 valid rows")).toBeInTheDocument();
    expect(screen.getByText("1 rows need correction")).toBeInTheDocument();
  });
});
