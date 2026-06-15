"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase-server";

export interface AuthResult {
  error?: string;
}

export async function login(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email et mot de passe requis." };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: traduireErreur(error.message) };
  }

  const next = String(formData.get("next") ?? "/profile");
  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/profile");
}

export async function signup(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();

  if (!email || !password || !fullName) {
    return { error: "Nom, email et mot de passe requis." };
  }
  if (password.length < 6) {
    return { error: "Le mot de passe doit faire au moins 6 caractères." };
  }

  const supabase = createClient();
  const origin = headers().get("origin") ?? "";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, whatsapp },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: traduireErreur(error.message) };
  }

  // If email confirmation is enabled, the user must confirm before a session exists.
  redirect("/auth/confirm");
}

export async function signout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

function traduireErreur(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email ou mot de passe incorrect.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Cet email est déjà utilisé.";
  if (m.includes("email not confirmed")) return "Confirme d'abord ton email.";
  if (m.includes("rate limit")) return "Trop de tentatives. Réessaie dans un instant.";
  return "Une erreur est survenue. Réessaie.";
}

export async function signInWithGoogle() {
  const supabase = createClient();
  const origin = headers().get("origin") ?? "";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=/profile` },
  });
  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent("Connexion Google échouée.")}`);
  }
  if (data?.url) redirect(data.url);
}

export async function requestPasswordReset(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email requis." };

  const supabase = createClient();
  const origin = headers().get("origin") ?? "";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });
  if (error) return { error: traduireErreur(error.message) };
  redirect("/auth/forgot-password?sent=1");
}

export async function updatePassword(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 6) return { error: "Le mot de passe doit faire au moins 6 caractères." };
  if (password !== confirm) return { error: "Les mots de passe ne correspondent pas." };

  const supabase = createClient();
  // The recovery session is established by /auth/callback exchanging the code.
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: traduireErreur(error.message) };

  revalidatePath("/", "layout");
  redirect("/profile");
}

export async function completeOnboarding(interests: string[]): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  await supabase.from("profiles").update({ onboarded: true, interests }).eq("id", user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}
