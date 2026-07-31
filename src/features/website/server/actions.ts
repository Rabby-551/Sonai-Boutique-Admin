"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { OperationsError } from "@/lib/operations-error";
import { createSonaiSupabaseServerClient } from "@/lib/supabase/server";
import {
  homepageContentSchema,
  websiteLocaleSchema,
  websiteStatusSchema,
} from "../schemas/website";
import type { WebsiteActionState } from "./action-state";

const value = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();

export async function updateHomepageAction(
  _previous: WebsiteActionState,
  form: FormData,
): Promise<WebsiteActionState> {
  try {
    await requirePermission("website.manage");
    if (env.COMMERCE_SOURCE !== "supabase" || env.AUTH_SOURCE !== "supabase") {
      throw new OperationsError(
        "STORE_INVALID",
        "Connect Supabase commerce and authentication to publish storefront content.",
      );
    }

    const locale = websiteLocaleSchema.parse(value(form, "locale"));
    const status = websiteStatusSchema.parse(value(form, "status"));
    const content = homepageContentSchema.parse({
      heroTitle: value(form, "heroTitle"),
      heroSubtitle: value(form, "heroSubtitle"),
      heroCtaLabel: value(form, "heroCtaLabel"),
      heroHref: value(form, "heroHref"),
      heroImage: value(form, "heroImage"),
      heroAlt: value(form, "heroAlt"),
      newArrivalsTitle: value(form, "newArrivalsTitle"),
      trendingTitle: value(form, "trendingTitle"),
    });
    const expectedVersion = z.coerce
      .number()
      .int()
      .positive()
      .parse(value(form, "expectedVersion"));
    const supabase = await createSonaiSupabaseServerClient();
    if (!supabase)
      throw new OperationsError(
        "STORE_INVALID",
        "Supabase session is unavailable.",
      );

    const { error } = await supabase.rpc("admin_upsert_site_content", {
      p_key: "homepage",
      p_locale: locale,
      p_title:
        locale === "en" ? "Sonai Boutique homepage" : "সোনাই বুটিক হোমপেজ",
      p_content: content,
      p_status: status,
      p_expected_version: expectedVersion,
    });
    if (error) throw new OperationsError("CONFLICT", error.message);

    revalidatePath("/website");
    return {
      status: "success",
      message:
        status === "published"
          ? "Homepage published to the storefront."
          : "Homepage draft saved.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof OperationsError
          ? error.message
          : error instanceof z.ZodError
            ? (error.issues[0]?.message ?? "Check the homepage content.")
            : "The homepage content could not be saved.",
    };
  }
}
