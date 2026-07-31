import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScannerInput } from "../components/scanner-input";
import type { InventoryRow } from "../schemas/inventory";

const row: InventoryRow = {
  variantId: "var-1",
  productId: "prod-1",
  productName: "Test Saree",
  sku: "SKU-001",
  barcode: "BAR-001",
  color: "Blue",
  size: "Free",
  unitCostMinor: 10000,
  threshold: 2,
  locations: {
    rupnagar: { onHand: 1, reserved: 0, thresholdOverride: null },
    "mirpur-shopping-center": {
      onHand: 0,
      reserved: 0,
      thresholdOverride: null,
    },
    "loc-online": { onHand: 4, reserved: 0, thresholdOverride: null },
  },
  balanceVersions: {
    rupnagar: 1,
    "mirpur-shopping-center": 1,
    "loc-online": 1,
  },
  totalOnHand: 5,
  totalReserved: 0,
  totalAvailable: 5,
  valuationMinor: 50000,
  status: "healthy",
};

describe("scanner input", () => {
  it("selects exact SKU/barcode values and announces unknown scans", async () => {
    const onSelect = vi.fn();
    render(<ScannerInput rows={[row]} onSelect={onSelect} />);
    const input = screen.getByLabelText("Scan barcode or enter SKU");
    await userEvent.type(input, "BAR-001{Enter}");
    expect(onSelect).toHaveBeenCalledWith(row);
    expect(screen.getByText("SKU-001 selected.")).toBeVisible();
    expect(input).toHaveFocus();
    await userEvent.type(input, "UNKNOWN{Enter}");
    expect(screen.getByText("Barcode or SKU was not found.")).toBeVisible();
  });
});
