import { SupabaseClient } from "@supabase/supabase-js";

export async function getCurrentSeasonByLeagueId(
    supabase: SupabaseClient,
    leagueId: number,
) {
    const { data, error } = await supabase
        .from("Leagues")
        .select("current_season_id")
        .eq("id", leagueId)
        .single();

    if (error) {
        throw error;
    }

    return data.current_season_id;
}