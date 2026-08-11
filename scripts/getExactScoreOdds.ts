import { calculateExpectedGoals } from "@/lib/calculations/calculateExpectedGoals";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { calculateScoreProbabilities } from "@/lib/calculations/calculateScoreProbabilities";
import { getRecentMatchesBySide } from "@/lib/db/getRecentMatchStats";
import {
  buildHomeStats,
  buildAwayStats,
} from "@/lib/calculations/calculateTeamStats";
import { getTeam } from "@/lib/db/getTeam";
import { getMatchesBySeasonAndMatchday } from "@/lib/db/getMatchesBySeasonAndMatchday";
import { upsertMatchScorePoints } from "@/lib/db/upsertMatchScorePoints";

export async function initGetExactScoreOddsScript(
  seasonId: number,
  matchday: string,
) {
  const matches = await getMatchesBySeasonAndMatchday(
    supabaseAdmin,
    seasonId,
    matchday,
  );

  await Promise.all(
    matches.map(async (match) => {
      const homeTeamStats = await getRecentMatchesBySide(
        supabaseAdmin,
        match.home_team_id,
        match.kickoff,
        match.season_id,
        "home",
      );

      const awayTeamStats = await getRecentMatchesBySide(
        supabaseAdmin,
        match.away_team_id,
        match.kickoff,
        match.season_id,
        "away",
      );

      const homeStats = buildHomeStats(homeTeamStats);
      const awayStats = buildAwayStats(awayTeamStats);

      const expectedGoalsStatsForMatch = calculateExpectedGoals(
        homeStats,
        awayStats,
      );

      const homeTeam = await getTeam(supabaseAdmin, match.home_team_id);
      const awayTeam = await getTeam(supabaseAdmin, match.away_team_id);

      if (homeTeam.promoted) {
        expectedGoalsStatsForMatch.expectedHomeGoals *= 0.5;
        expectedGoalsStatsForMatch.expectedAwayGoals *= 1.5;
      }
      if (awayTeam.promoted) {
        expectedGoalsStatsForMatch.expectedHomeGoals *= 1.5;
        expectedGoalsStatsForMatch.expectedAwayGoals *= 0.5;
      }

      const scores = calculateScoreProbabilities(
        expectedGoalsStatsForMatch.expectedHomeGoals,
        expectedGoalsStatsForMatch.expectedAwayGoals,
      );
      await upsertMatchScorePoints(supabaseAdmin, match.id, scores);
    }),
  );
}

async function main() {
  const seasonId = 4;
  const matchday = "2. Spieltag";

  try {
    await initGetExactScoreOddsScript(seasonId, matchday);

    console.log("Finished generating exact score odds");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
