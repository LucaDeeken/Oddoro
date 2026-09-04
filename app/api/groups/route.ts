import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/getProfile";
import { getCurrentSeasonByLeagueId } from "@/lib/db/getCurrentSeasonByLeagueId";

export async function POST(req: Request) {
    try {
        const { name, leagueId } = await req.json();

        // Eingaben prüfen
        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json(
                { error: "Gruppenname fehlt" },
                { status: 400 },
            );
        }

        if (!leagueId || typeof leagueId !== "number") {
            return NextResponse.json(
                { error: "Liga fehlt" },
                { status: 400 },
            );
        }

        const supabase = await createClient();

        // User prüfen
        const { user, profile } = await getProfile(supabase);

        if (!user || !profile) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        //current SeasonID holen
        const activeSeasonId = await getCurrentSeasonByLeagueId(
            supabase,
            leagueId,
        );

        // 1. Gruppe erstellen
        const { data: group, error: groupError } = await supabase
            .from("Groups")
            .insert({
                name: name.trim(),
                active_season_id: activeSeasonId,
                created_by: profile.id,
            })
            .select("id, name, active_season_id")
            .single();

        if (groupError) {
            console.error("Create group error:", groupError);
            throw groupError;
        }

        // 2. Ersteller automatisch als Admin hinzufügen
        const { error: memberError } = await supabase
            .from("GroupMembers")
            .insert({
                group_id: group.id,
                user_id: profile.id,
                role: "admin",
            });

        if (memberError) {
            console.error(
                "Create group member error:",
                memberError,
            );

            // Gruppe wieder löschen,
            // falls Member-Erstellung fehlschlägt
            await supabase
                .from("Groups")
                .delete()
                .eq("id", group.id);

            throw memberError;
        }

        return NextResponse.json({
            success: true,
            group,
        });
    } catch (error) {
        console.error("Create group error:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unbekannter Fehler",
            },
            { status: 500 },
        );
    }
}

//GET CALL
import { getMyGroups } from "@/lib/db/getMyGroups";

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

        const groups = await getMyGroups(
            supabase,
            profile.id,
        );

        return NextResponse.json({
            groups,
        });
    } catch (error) {
        console.error("Get groups error:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Gruppen konnten nicht geladen werden",
            },
            { status: 500 },
        );
    }
}