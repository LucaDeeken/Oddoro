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

        const { data: leagues, error } = await supabase
            .from("Leagues")
            .select("id, name")
            .order("name");

        if (error) {
            throw error;
        }

        return NextResponse.json(leagues);
    } catch (error) {
        console.error("Leagues error:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            },
            { status: 500 },
        );
    }
}