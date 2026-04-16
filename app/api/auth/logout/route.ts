import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/logout
 * Signs out the current user and clears the session cookie.
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Auth Logout]", err);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}
