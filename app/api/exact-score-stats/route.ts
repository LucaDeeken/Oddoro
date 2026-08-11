import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

import { getMatchScorePoints } from "@/lib/db/getMatchScorePoints";

export async function POST(req: Request) {
  try {
    const { matchId } = await req.json();
    const supabase = await createClient();

    const result = await getMatchScorePoints(supabase, matchId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("exact-score-stats error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
