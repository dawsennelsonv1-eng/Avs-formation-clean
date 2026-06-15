import { NextResponse, type NextRequest } from "next/server";

/**
 * No-op middleware.
 *
 * The Supabase SSR client uses Node APIs unsupported on Vercel's Edge runtime,
 * which caused MIDDLEWARE_INVOCATION_FAILED. Session refresh still happens inside
 * Server Components via lib/supabase/server.ts, so disabling the middleware does
 * not break authentication — users can still sign in and stay signed in.
 *
 * The matcher targets a path that never occurs in normal use, so this function
 * effectively runs on nothing. (An empty matcher array is rejected by the Vercel
 * builder with "Route must define src or source", so we use a dummy path string.)
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/__middleware_disabled__"],
};
