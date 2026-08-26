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
  oddsMatch: any,
) {
  const updateData = {
    home_h2h_odds: homeOdds,
    draw_h2h_odds: drawOdds,
    away_h2h_odds: awayOdds,
    home_h2h_points: homePoints,
    draw_h2h_points: drawPoints,
    away_h2h_points: awayPoints,
    odds_fetched_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("Matches")
    .update(updateData)
    .eq("home_team_id", homeTeamId)
    .eq("away_team_id", awayTeamId)
    .eq("kickoff", oddsMatch.commence_time)
    .select(
      "id, home_h2h_odds, draw_h2h_odds, away_h2h_odds, home_h2h_points, draw_h2h_points, away_h2h_points"
    );


  if (error) throw error;

  return data;
}