import { SupabaseClient } from "@supabase/supabase-js";

type ScorePoint = {
  home_goals: number;
  away_goals: number;
  probability: number;
  odd: number;
  points: number;
};

export async function upsertMatchScorePoints(
  supabase: SupabaseClient,
  matchId: number,
  scores: ScorePoint[],
) {
  const rows = scores.map((score) => ({
    match_id: matchId,
    home_goals: score.home_goals,
    away_goals: score.away_goals,
    probability: score.probability,
    odd: score.odd,
    points: score.points,
  }));

  const { error } = await supabase.from("Match_Score_Points").upsert(rows, {
    onConflict: "match_id,home_goals,away_goals",
  });

  if (error) {
    console.error("Error upserting match score points:", error);

    throw error;
  }
}
