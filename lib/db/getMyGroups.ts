import { SupabaseClient } from "@supabase/supabase-js";

export async function getMyGroups(
    supabase: SupabaseClient,
    profileId: string,
) {
    // 1. Eigene Gruppenmitgliedschaften holen
    const { data: memberships, error: membershipsError } = await supabase
        .from("GroupMembers")
        .select(`
            role,
            group_id,
            Groups (
                id,
                name,
                active_season_id
            )
        `)
        .eq("user_id", profileId);

    if (membershipsError) {
        throw membershipsError;
    }

    if (!memberships || memberships.length === 0) {
        return [];
    }

    // 2. Season IDs aus den Gruppen holen
    const seasonIds = memberships
        .map((membership) => membership.Groups?.active_season_id)
        .filter((id): id is number => id !== null);

    if (seasonIds.length === 0) {
        return memberships;
    }

    // 3. Seasons holen
    const { data: seasons, error: seasonsError } = await supabase
        .from("Seasons")
        .select(`
            id,
            year,
            league_id
        `)
        .in("id", seasonIds);

    if (seasonsError) {
        throw seasonsError;
    }

    // 4. Liga-IDs holen
    const leagueIds = seasons
        .map((season) => season.league_id)
        .filter((id): id is number => id !== null);

    const { data: leagues, error: leaguesError } = await supabase
        .from("Leagues")
        .select(`
            id,
            name
        `)
        .in("id", leagueIds);

    if (leaguesError) {
        throw leaguesError;
    }

    // 5. Alles zusammenbauen
    return memberships.map((membership) => {
        const group = membership.Groups;

        if (!group) {
            return membership;
        }

        const season = seasons?.find(
            (season) => season.id === group.active_season_id,
        );

        const league = season
            ? leagues?.find(
                (league) => league.id === season.league_id,
            )
            : null;

        return {
            ...membership,
            Groups: {
                ...group,
                Seasons: season
                    ? {
                        ...season,
                        Leagues: league,
                    }
                    : null,
            },
        };
    });
}