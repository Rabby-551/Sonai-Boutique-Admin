import "server-only";

import { env } from "@/lib/env";
import { createSonaiSupabaseServerClient } from "@/lib/supabase/server";
import {
  homepageContentSchema,
  homepageDefaults,
  homepageRecordSchema,
  type HomepageRecord,
  type WebsiteLocale,
} from "../schemas/website";

type SiteContentRow = {
  key: string;
  locale: WebsiteLocale;
  title: string;
  content: unknown;
  status: "draft" | "published" | "archived";
  version: number;
  published_at: string | null;
  updated_at: string | null;
};

function fallback(locale: WebsiteLocale): HomepageRecord {
  return homepageRecordSchema.parse({
    key: "homepage",
    locale,
    title: locale === "en" ? "Sonai Boutique homepage" : "সোনাই বুটিক হোমপেজ",
    content: homepageDefaults[locale],
    status: "published",
    version: 1,
    publishedAt: null,
    updatedAt: null,
  });
}

function fromRow(row: SiteContentRow): HomepageRecord {
  const locale = row.locale;
  const content = homepageContentSchema.safeParse(row.content);
  return homepageRecordSchema.parse({
    key: "homepage",
    locale,
    title: row.title,
    content: content.success ? content.data : homepageDefaults[locale],
    status: row.status,
    version: row.version,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  });
}

export async function getHomepageRecords(): Promise<HomepageRecord[]> {
  if (env.COMMERCE_SOURCE !== "supabase")
    return [fallback("en"), fallback("bn")];

  const supabase = await createSonaiSupabaseServerClient();
  if (!supabase) return [fallback("en"), fallback("bn")];

  const { data, error } = await supabase
    .from("site_content")
    .select(
      "key, locale, title, content, status, version, published_at, updated_at",
    )
    .eq("key", "homepage")
    .order("locale");

  if (error)
    throw new Error(`Could not load storefront content: ${error.message}`);
  const records = ((data ?? []) as SiteContentRow[]).map(fromRow);
  return (["en", "bn"] as const).map(
    (locale) =>
      records.find((record) => record.locale === locale) ?? fallback(locale),
  );
}
