import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. SERVER ONLY — never import this into a Client Component.
 * Bypasses RLS, so it is used for:
 *  - the SMS forwarder webhook (writing forwarded_sms)
 *  - calling verify_payment() which reads/consumes forwarded_sms
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
