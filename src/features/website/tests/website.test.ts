import { describe, expect, it } from "vitest";
import { homepageContentSchema, homepageDefaults } from "../schemas/website";

describe("website homepage content", () => {
  it("keeps both storefront locales valid", () => {
    expect(homepageContentSchema.parse(homepageDefaults.en).heroHref).toBe(
      "/collections/batik-sarees",
    );
    expect(
      homepageContentSchema.parse(homepageDefaults.bn).heroTitle,
    ).toContain("বাটিক");
  });

  it("rejects external artwork URLs", () => {
    expect(
      homepageContentSchema.safeParse({
        ...homepageDefaults.en,
        heroImage: "https://example.com/unapproved.jpg",
      }).success,
    ).toBe(false);
  });
});
