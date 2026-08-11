// app/api/predictions/save/route.ts

import { NextResponse } from "next/server";
import { getProfile } from "@/lib/db/getProfile";
import { savePredictions } from "@/lib/db/savePredictions";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { prediction } = await req.json();

    const supabase = await createClient();

    const { user, profile } = await getProfile(supabase);

    if (!user || !profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await savePredictions(user.id, prediction);

    return NextResponse.json(result);
  } catch (error) {
    console.error("save-predictions error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
