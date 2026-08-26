import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/getProfile";

export async function GET() {
  try {
    const supabase = await createClient();

    const { user, profile } = await getProfile(supabase);

    if (!user || !profile) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    console.log(profile)
    if (!profile.is_admin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    const { data: leagues, error } = await supabase
      .from("Leagues")
      .select("id, name")
      .order("name");

    if (error) {
      throw error;
    }
    console.log(leagues)
    console.log(error);
    return NextResponse.json(leagues);
  } catch (error) {
    console.error("Admin leagues error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}