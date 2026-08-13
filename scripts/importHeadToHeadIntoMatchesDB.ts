import { getOddsApi } from "@/lib/api/oddsApi";
import { oddsApiTeamNameMap } from "@/lib/mapping/clubNames";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getTeamIdByName } from "@/lib/db/getTeamIdByName";
import { getHeadToHeadOdd } from "@/lib/calculations/calculateHeadToHeadOdd";
import { updateH2HIntoMatches } from "@/lib/db/updateHeadToHeadIntoMatches";
import { calculateHeadToHeadPoints } from "@/lib/calculations/calculateHeadToHeadPoints";

function mapOddsName(name: string) {
  return oddsApiTeamNameMap[name] ?? name;
}

async function init() {
  const oddsMatches = await getOddsApi();

  for (const oddsMatch of oddsMatches) {
    const homeName = mapOddsName(oddsMatch.home_team);
    const awayName = mapOddsName(oddsMatch.away_team);

    const homeTeamId = await getTeamIdByName(supabaseAdmin, homeName);
    const awayTeamId = await getTeamIdByName(supabaseAdmin, awayName);

    const homeWinOdd = getHeadToHeadOdd(oddsMatch, 1, 0);
    const drawOdd = getHeadToHeadOdd(oddsMatch, 1, 1);
    const awayWinOdd = getHeadToHeadOdd(oddsMatch, 0, 1);

    const homeWinPoints = calculateHeadToHeadPoints(homeWinOdd);
    const drawPoints = calculateHeadToHeadPoints(drawOdd);
    const awayWinPoints = calculateHeadToHeadPoints(awayWinOdd);

    const update = await updateH2HIntoMatches(
      supabaseAdmin,
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
  }
}
init().catch(console.error);
