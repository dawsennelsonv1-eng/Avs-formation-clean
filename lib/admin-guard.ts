import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export interface AdminUser {
  id: string;
  email: string | null;
  fullName: string;
}

/**
 * Server-side admin gate. Returns the admin user or redirects.
 * A user is admin when profiles.role = 'admin'.
 */
export async function requireAdmin(): Promise<AdminUser> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/");

  return { id: user.id, email: user.email ?? null, fullName: profile?.full_name ?? "Admin" };
}

export async function isAdmin(): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return false;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    return data?.role === "admin";
  } catch {
    return false;
  }
}
