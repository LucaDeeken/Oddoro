import { SupabaseClient } from "@supabase/supabase-js";

export async function savePredictions(
  supabase: SupabaseClient,
    profileId: string,
  predictions: Prediction[]
) {
  const predictionsToSave = predictions
    .filter(
      (prediction) =>
        !prediction.isFinished &&
        prediction.homeGoals !== null &&
        prediction.awayGoals !== null
    )
    .map((prediction) => ({
      profile_id: profileId,
      match_id: prediction.matchId,
      predicted_home_goals: prediction.homeGoals,
      predicted_away_goals: prediction.awayGoals,
      score_points_id: /* hier deine score_points_id */,
    }));

  if (predictionsToSave.length === 0) {
    return;
  }

  const { data, error } = await supabase
    .from('Predictions')
    .upsert(predictionsToSave, {
      onConflict: 'profile_id,match_id',
    })
    .select();

  if (error) {
    throw error;
  }

  return data;
}