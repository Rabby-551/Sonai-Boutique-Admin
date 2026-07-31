import { describe, expect, it } from "vitest";
import { reportToCsv } from "../utils/csv";
describe("report CSV", () => {
  it("emits UTF-8 and neutralizes spreadsheet formulas", () => {
    const csv = reportToCsv({
      title: "Test",
      description: "Test",
      metrics: [],
      columns: [{ key: "name", label: "Name", format: "text" }],
      rows: [{ name: '=HYPERLINK("bad")' }],
    });
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("'=HYPERLINK");
  });
});
