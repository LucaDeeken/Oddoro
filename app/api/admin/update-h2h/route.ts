import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/db/getProfile";
import { updateHeadToHead } from "@/lib/admin/importHeadToHeadIntoMatches";

export async function POST(req: Request) {
  try {
    const { leagueId } = await req.json();

    const supabase = await createClient();

    // Auth + Admin prüfen
    const { user, profile } = await getProfile(supabase);

    if (!user || !profile) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!profile.is_admin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    // Liga laden
    const { data: league, error: leagueError } = await supabase
      .from("Leagues")
      .select("id, name, odds_api_sport_key")
      .eq("id", leagueId)
      .single();

    if (leagueError || !league) {
      return NextResponse.json(
        { error: "League not found" },
        { status: 404 },
      );
    }

    if (!league.odds_api_sport_key) {
      return NextResponse.json(
        { error: "No Odds API sport key configured for this league" },
        { status: 400 },
      );
    }

    // H2H aktualisieren
    const result = await updateHeadToHead(
      supabaseAdmin,
      league.odds_api_sport_key,
    );

    return NextResponse.json({
      success: true,
      league: league.name,
      ...result,
    });
  } catch (error) {
    console.error("Admin H2H update error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}