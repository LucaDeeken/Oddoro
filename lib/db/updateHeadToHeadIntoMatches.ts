import { SupabaseClient } from "@supabase/supabase-js";

export async function updateH2HIntoMatches(
  supabase: SupabaseClient,
  homeOdds: number,
  drawOdds: number,
  awayOdds: number,
  homePoints: number,
  drawPoints: number,
  awayPoints: number,
  homeTeamId: number,
  awayTeamId: number,
  oddsMatch,
) {
  const { error } = await supabase
    .from("Matches")
    .update({
      home_h2h_odds: homeOdds,
      draw_h2h_odds: drawOdds,
      away_h2h_odds: awayOdds,
      home_h2h_points: homePoints,
      draw_h2h_points: drawPoints,
      away_h2h_points: awayPoints,
      odds_fetched_at: new Date().toISOString(),
    })
    .eq("home_team_id", homeTeamId)
    .eq("away_team_id", awayTeamId)
    .eq("kickoff", oddsMatch.commence_time);

  if (error) throw error;

  return;
}
