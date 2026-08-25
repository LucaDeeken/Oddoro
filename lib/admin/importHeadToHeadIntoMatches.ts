import { getOddsApi } from "@/lib/api/oddsApi";
import { oddsApiTeamNameMap } from "@/lib/mapping/clubNames";
import { getTeamIdByName } from "@/lib/db/getTeamIdByName";
import { getHeadToHeadOdd } from "@/lib/calculations/calculateHeadToHeadOdd";
import { updateH2HIntoMatches } from "@/lib/db/updateHeadToHeadIntoMatches";
import { calculateHeadToHeadPoints } from "@/lib/calculations/calculateHeadToHeadPoints";
import { SupabaseClient } from "@supabase/supabase-js";

function mapOddsName(name: string) {
  return oddsApiTeamNameMap[name] ?? name;
}

export async function updateHeadToHead(supabase: SupabaseClient, sportskey: string) {
  const oddsMatches = await getOddsApi(sportskey);

  let updated = 0;

  for (const oddsMatch of oddsMatches) {
    const homeName = mapOddsName(oddsMatch.home_team);
    const awayName = mapOddsName(oddsMatch.away_team);

    const homeTeamId = await getTeamIdByName(supabase, homeName);
    const awayTeamId = await getTeamIdByName(supabase, awayName);

    const homeWinOdd = getHeadToHeadOdd(oddsMatch, 1, 0);
    const drawOdd = getHeadToHeadOdd(oddsMatch, 1, 1);
    const awayWinOdd = getHeadToHeadOdd(oddsMatch, 0, 1);

    const homeWinPoints = calculateHeadToHeadPoints(homeWinOdd);
    const drawPoints = calculateHeadToHeadPoints(drawOdd);
    const awayWinPoints = calculateHeadToHeadPoints(awayWinOdd);

    await updateH2HIntoMatches(
      supabase,
      homeWinOdd,
      drawOdd,
      awayWinOdd,
      homeWinPoints,
      drawPoints,
      awayWinPoints,
      homeTeamId,
      awayTeamId,
      oddsMatch,
    );

    updated++;
  }

  return {
    updated,
  };
}