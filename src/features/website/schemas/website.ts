import { z } from "zod";

export const websiteLocaleSchema = z.enum(["en", "bn"]);
export const websiteStatusSchema = z.enum(["draft", "published", "archived"]);

export const homepageContentSchema = z.object({
  heroTitle: z.string().min(2).max(120),
  heroSubtitle: z.string().min(2).max(180),
  heroCtaLabel: z.string().min(2).max(50),
  heroHref: z
    .string()
    .regex(/^\/[a-z0-9\-/]+$/i, "Use a storefront path beginning with /."),
  heroImage: z
    .string()
    .regex(/^\/assets\/[a-z0-9_./-]+$/i, "Use an image from /assets/."),
  heroAlt: z.string().min(2).max(180),
  newArrivalsTitle: z.string().min(2).max(80),
  trendingTitle: z.string().min(2).max(80),
});

export const homepageRecordSchema = z.object({
  key: z.literal("homepage"),
  locale: websiteLocaleSchema,
  title: z.string(),
  content: homepageContentSchema,
  status: websiteStatusSchema,
  version: z.number().int().positive(),
  publishedAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type WebsiteLocale = z.infer<typeof websiteLocaleSchema>;
export type WebsiteStatus = z.infer<typeof websiteStatusSchema>;
export type HomepageContent = z.infer<typeof homepageContentSchema>;
export type HomepageRecord = z.infer<typeof homepageRecordSchema>;

export const homepageDefaults: Record<WebsiteLocale, HomepageContent> = {
  en: {
    heroTitle: "The Batik Saree Edit",
    heroSubtitle: "Authentic Sonai photography · Sarees",
    heroCtaLabel: "Explore collection",
    heroHref: "/collections/batik-sarees",
    heroImage:
      "/assets/sonai/editorial/generated-banners/hero-batik-saree-edit.png",
    heroAlt: "Three authentic Sonai batik sarees in pink, brown and navy",
    newArrivalsTitle: "What's new",
    trendingTitle: "Trending",
  },
  bn: {
    heroTitle: "বাটিক শাড়ির রঙ",
    heroSubtitle: "সোনাইয়ের নিজস্ব ছবি · শাড়ি",
    heroCtaLabel: "কালেকশন দেখুন",
    heroHref: "/collections/batik-sarees",
    heroImage:
      "/assets/sonai/editorial/generated-banners/hero-batik-saree-edit.png",
    heroAlt: "গোলাপি, বাদামি ও নেভি রঙের তিনটি সোনাই বাটিক শাড়ি",
    newArrivalsTitle: "নতুন কী",
    trendingTitle: "জনপ্রিয়",
  },
};
