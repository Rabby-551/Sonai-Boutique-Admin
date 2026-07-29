import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VariantEditor } from "../components/variant-editor";
import type { ProductVariant } from "../schemas/catalog";

const variant: ProductVariant = {
  id: "variant-1",
  sku: "",
  color: "Default",
  size: "Free",
  priceMinor: null,
  stock: 0,
  barcode: "",
  active: true,
};

describe("VariantEditor", () => {
  it("derives the initial barcode from a typed SKU", () => {
    const onChange = vi.fn();
    render(<VariantEditor value={[variant]} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("SKU"), {
      target: { value: "SH-TEST-1" },
    });

    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ sku: "SH-TEST-1", barcode: "SHTEST1" }),
    ]);
  });

  it("adds a focused independent variant row", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<VariantEditor value={[variant]} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Add variant" }));

    expect(onChange).toHaveBeenCalledWith([
      variant,
      expect.objectContaining({ color: "Default", priceMinor: null }),
    ]);
  });
});
