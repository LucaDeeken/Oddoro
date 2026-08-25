"use client";
import { useEffect, useState } from "react";
import { Predictions, PredictionSummaryType } from "@/types/predicitonsType";

import styles from "./TippingDashboard.module.css";

import MatchCard from "@/components/MatchCard";
import DateWrapper from "@/components/DateWrapper";
import SavePredictionSummary from "@/components/SavePredictionSummary";

import { SliderWhite } from "@/components/Slider";

export default function TippingDashboard({ wholeSeasonGames }) {
  //Speichert die TorTipps des Users
  const [predictions, setPredictions] = useState<Predictions>([]);
  const [matchday, setMatchday] = useState(1);

  //aktuallisiert den TippState des Users
  function updatePrediction(
    match,
    homeGoals: number | null,
    awayGoals: number | null,
    h2hPoints: number | null,
    exactPoints: number | null,
    isFinished: boolean,
  ) {
    setPredictions((prev) => [
      ...prev.filter((prediction) => prediction.matchId !== match.id),
      {
        matchId: match.id,
        homeTeam: match.home_team.name,
        awayTeam: match.away_team.name,
        commenceTime: match.kickoff,
        homeGoals,
        awayGoals,
        h2hPoints,
        exactPoints,
        isFinished: match.is_finished,
      },
    ]);
  }

  console.log(wholeSeasonGames);
  const totalHeadToHeadPoints = Object.values(predictions).reduce(
    (sum, prediction) => sum + (prediction.h2hPoints ?? 0),
    0,
  );

  const totalExactPoints = Object.values(predictions).reduce(
    (sum, prediction) => sum + (prediction.exactPoints ?? 0),
    0,
  );

  const predictionsCounterUpdated = Object.values(predictions).reduce(
    (sum, prediction) => sum + (prediction.exactPoints > 0 ? 1 : 0),
    0,
  );

  const matchesLengthUpdated = Object.entries(predictions).length;

  const predictionSummary: PredictionSummaryType = {
    matchesLength: matchesLengthUpdated,
    predictionsCounter: predictionsCounterUpdated,
  };

  console.log(predictions);

  const numberOfMatchdays = new Set(wholeSeasonGames.map((match) => match.matchday))
    .size;

  const filteredMatches = wholeSeasonGames.filter(
    (match) => match.matchday === `${matchday}. Spieltag`,
  );

  let isMatchdayLocked = false;

  for (const match of filteredMatches) {
    const hasOdds =
      match.home_h2h_odds !== null &&
      match.draw_h2h_odds !== null &&
      match.away_h2h_odds !== null;

    console.log(hasOdds);
    if (!hasOdds || match.is_finished) {
      isMatchdayLocked = true;
      break;
    }
  }
  console.log(isMatchdayLocked);
  //hole alle individuellen Datumseinträge
  const dates: string[] = [];
  for (const match of filteredMatches) {
    const date = new Date(match.kickoff).toLocaleDateString("de-DE");
    if (!dates.includes(date)) {
      dates.push(date);
    }
  }
  console.log(filteredMatches);

  //sortiert das Season Array und bestimmt den nächst anstehenden Spieltag
  useEffect(() => {
    const now = new Date();

    const nextMatch = wholeSeasonGames
      .filter((match) => new Date(match.kickoff) > now)
      .sort(
        (a, b) =>
          new Date(a.kickoff).getTime() -
          new Date(b.kickoff).getTime()
      )[0];

    if (nextMatch) {
      const currentMatchday = Number(
        nextMatch.matchday.match(/\d+/)?.[0]
      );

      setMatchday(currentMatchday);
    }
  }, [wholeSeasonGames]);

  return (
    <>
      <main className={styles.main}>
        <h2 className={styles.spieltagHeader}>{matchday}. Spieltag</h2>
        <SliderWhite
          numberOfMatchdays={numberOfMatchdays}
          value={matchday}
          onChange={setMatchday}
        />
        {dates.map((date) => {
          const matchesForDate = filteredMatches.filter((match) => {
            const matchDate = new Date(match.kickoff).toLocaleDateString(
              "de-DE",
            );

            return matchDate === date;
          });

          return (
            <DateWrapper key={date} date={date}>
              {matchesForDate.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onPredictionChange={updatePrediction}
                  isLocked={isMatchdayLocked}

                />
              ))}
            </DateWrapper>
          );
        })}
        <SavePredictionSummary
          totalExactPoints={totalExactPoints}
          totalHeadToHeadPoints={totalHeadToHeadPoints}
          predictionSummary={predictionSummary}
          predictions={predictions}
        />
      </main>
    </>
  );
}
