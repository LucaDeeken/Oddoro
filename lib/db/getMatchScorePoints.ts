import { SupabaseClient } from "@supabase/supabase-js";

export async function getMatchScorePoints(
  supabase: SupabaseClient,
  matchId: number,
) {
  console.log(matchId);
  const { data, error } = await supabase
    .from("match_score_points")
    .select(
      `
      home_goals,
      away_goals,
      probability,
      odd,
      points
      `,
    )
    .eq("match_id", matchId)
    .order("home_goals", { ascending: true })
    .order("away_goals", { ascending: true });

  if (error) {
    console.error("GET MATCH SCORE POINTS ERROR:", error);
    throw error;
  }
  console.log(data);
  return data;
}
