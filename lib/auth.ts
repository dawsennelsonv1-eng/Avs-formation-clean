import { createClient } from "@/lib/supabase-server";

export interface CurrentUser {
  id: string;
  email: string | null;
  fullName: string;
  whatsapp: string | null;
  onboarded: boolean;
}

const configured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Returns the signed-in user (with profile name) or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!configured()) return null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,whatsapp,onboarded")
      .eq("id", user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email ?? null,
      fullName: profile?.full_name ?? user.email?.split("@")[0] ?? "Membre",
      whatsapp: profile?.whatsapp ?? null,
      onboarded: profile?.onboarded ?? false,
    };
  } catch {
    return null;
  }
}
