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
  const handlePredicitonSave = async () => {
    try {
      console.log(predictions)
      const response = await fetch("/api/predictions/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prediction: predictions,
        }),
      });

      const data = await response.json();

      console.log(data);
      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Speichern");
      }

      console.log("Prediction gespeichert:", data);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
  };

  return (
    <section className={styles.section}>
      <p className={styles.predictionSum}>
        Getippte Spiele: <br />
        {predictionSummary.predictionsCounter}/
        {predictionSummary.matchesLength}
      </p>

      <SaveButton handlePredicitonSave={handlePredicitonSave} />

      <p className={styles.maxPoints}>
        Maximale Punkteausbeute: {totalExactPoints}
      </p>
    </section>
  );
}