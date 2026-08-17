import { SupabaseClient } from "@supabase/supabase-js";
import { Prediction } from "@/types/predicitonsType";

export async function savePredictions(
  supabase: SupabaseClient,
  profileId: string,
  predictions: Prediction[],
) {
  const predictionsToSave = predictions.filter(
    (prediction) =>
      !prediction.isFinished &&
      prediction.homeGoals !== null &&
      prediction.awayGoals !== null,
  );

  if (predictionsToSave.length === 0) {
    return [];
  }

  // Alle benötigten Match IDs
  const matchIds = predictionsToSave.map(
    (prediction) => prediction.matchId,
  );

  // Alle Score-Points-Rows der betreffenden Matches holen
  const { data: scorePoints, error: scorePointsError } = await supabase
    .from("Match_Score_Points")
    .select("id, match_id, home_goals, away_goals")
    .in("match_id", matchIds);

  if (scorePointsError) {
    throw scorePointsError;
  }

  // Predictions mit der passenden score_points_id bauen
  const predictionsToSaveWithScoreId = predictionsToSave.map(
    (prediction) => {
      const scorePoint = scorePoints.find(
        (scorePoint) =>
          scorePoint.match_id === prediction.matchId &&
          scorePoint.home_goals === prediction.homeGoals &&
          scorePoint.away_goals === prediction.awayGoals,
      );

      if (!scorePoint) {
        throw new Error(
          `Keine Match_Score_Points für Match ${prediction.matchId} und Ergebnis ${prediction.homeGoals}:${prediction.awayGoals} gefunden.`,
        );
      }

      return {
        profile_id: profileId,
        match_id: prediction.matchId,
        predicted_home_goals: prediction.homeGoals,
        predicted_away_goals: prediction.awayGoals,
        score_points_id: scorePoint.id,
      };
    },
  );

  const { data, error } = await supabase
    .from("Predictions")
    .upsert(predictionsToSaveWithScoreId, {
      onConflict: "profile_id,match_id",
    })
    .select();

  if (error) {
    throw error;
  }

  return data;
}