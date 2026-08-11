export type Prediction = {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  homeGoals: number | null;
  awayGoals: number | null;
  h2hPoints: number | null;
  exactPoints: number | null;
  isFinished: boolean;
};

export type Predictions = Prediction[];

export type PredictionSummaryType = {
  matchesLength: number;
  predictionsCounter: number;
};
