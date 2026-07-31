"use server";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createSonaiSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  if (env.AUTH_SOURCE === "mock") redirect("/dashboard");

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/login?error=missing");

  const supabase = await createSonaiSupabaseServerClient();
  if (!supabase) redirect("/login?error=configuration");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) redirect("/login?error=credentials");

  const { data: staffRole } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!staffRole?.role) {
    await supabase.auth.signOut();
    redirect("/login?error=role");
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createSonaiSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}
