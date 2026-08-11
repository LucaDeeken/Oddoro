"use client";

import { Predictions, PredictionSummaryType } from "@/types/predicitonsType";
import SaveButton from "@/components/SaveButton";

import styles from "./SavePredictionSummary.module.css";

export default function SavePredictionSummary({
  totalExactPoints,
  totalHeadToHeadPoints,
  predictionSummary,
  predictions,
}: {
  totalExactPoints: number | null;
  totalHeadToHeadPoints: number | null;
  predictionSummary: PredictionSummaryType;
  predictions: Predictions;
}) {
  return (
    <>
      <section className={styles.section}>
        <p className={styles.predictionSum}>
          Getippte Spiele: <br></br> {predictionSummary.predictionsCounter}/
          {predictionSummary.matchesLength}
        </p>
        <SaveButton></SaveButton>
        <p className={styles.maxPoints}>
          Maximale Punkteausbeute: {totalExactPoints}
        </p>
      </section>
    </>
  );
}
