"use client";
import { Card, NumberInput } from "@mantine/core";
import styles from "./MatchCard.module.css";
import { useState, useEffect } from "react";

export default function MatchCard({ match, onPredictionChange }) {
  const [homeGoals, setHomeGoals] = useState<number | null>(null);
  const [awayGoals, setAwayGoals] = useState<number | null>(null);
  const [scoreStats, setScoreStats] = useState<ScoreStat[]>([]);

  type ScoreStat = {
    home_goals: number;
    away_goals: number;
    probability: number;
    odd: number;
    points: number;
  };

  useEffect(() => {
    async function loadScoreStats() {
      try {
        const res = await fetch("/api/exact-score-stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            matchId: match.id,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("API Fehler:", data);
          return;
        }

        setScoreStats(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    loadScoreStats();
  }, [match.id]);

  const exactScoreData =
    homeGoals == null || awayGoals == null
      ? null
      : scoreStats.find(
          (item) =>
            item.home_goals === homeGoals && item.away_goals === awayGoals,
        );

  let points = exactScoreData?.points ?? 0;
  const hasPrediction = homeGoals !== null && awayGoals !== null;

  if (hasPrediction) {
    if (homeGoals === awayGoals) {
      points += Math.round(match.draw_h2h_odds);
    } else if (homeGoals > awayGoals) {
      // Heim gewinnt
      if (match.home_h2h_odds > match.away_h2h_odds) {
        points += Math.round(match.home_h2h_odds);
      }
    } else {
      // Auswärts gewinnt
      if (match.away_h2h_odds > match.home_h2h_odds) {
        points += Math.round(match.away_h2h_odds);
      }
    }
  }

  const tendencyPoints =
    homeGoals == null || awayGoals == null
      ? null
      : homeGoals > awayGoals
        ? match.home_h2h_points
        : homeGoals < awayGoals
          ? match.away_h2h_points
          : match.draw_h2h_points;

  useEffect(() => {
    onPredictionChange(match, homeGoals, awayGoals, tendencyPoints, points);
  }, [homeGoals, awayGoals, tendencyPoints, points]);
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className={styles.card}
    >
      {/* Inputs */}
      <div className={styles.inputs}>
        <NumberInput
          hideControls
          className={styles.numberInput}
          classNames={{
            label: styles.label,
            input: styles.input,
          }}
          label={match.home_team.name}
          min={0}
          max={9}
          placeholder="0"
          onChange={(value) => {
            if (typeof value === "number") {
              setHomeGoals(value);
            } else {
              setHomeGoals(null);
            }
          }}
        />
        <span className={styles.spanBetweenGoals}>:</span>
        <NumberInput
          hideControls
          className={styles.numberInput}
          classNames={{
            label: styles.label,
            input: styles.input,
          }}
          label={match.away_team.name}
          min={0}
          max={9}
          placeholder="0"
          onChange={(value) => {
            if (typeof value === "number") {
              setAwayGoals(value);
            } else {
              setAwayGoals(null);
            }
          }}
        />
      </div>

      {/* Odds Info */}
      <div className={styles.oddsWrapper}>
        <p className={styles.oddsLabel}>
          Richtige Tendenz:{" "}
          <span className={styles.oddsValue}>{tendencyPoints ?? "-"}</span>
        </p>
        <p className={styles.oddsLabel}>
          Exaktes Ergebnis:{" "}
          <span className={styles.oddsValueExact}>
            {homeGoals == null || awayGoals == null
              ? "-"
              : exactScoreData?.odd == null
                ? "-"
                : points}
          </span>
        </p>
      </div>
    </Card>
  );
}
