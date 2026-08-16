/** Local FastAPI contract for the Blue-Green Current PRAGATI AI dashboard. */

export type ModelStatus = "loading" | "ready" | "unavailable";

export interface ModelPrediction {
  commodity: string;
  category: string;
  sourceCentre: string;
  state: string;
  observationDate: string;
  observedPricePerKg: number;
  predictedReturn7dPct: number;
  predictedPricePerKg: number;
  spikeProbability: number;
  featureCount: number;
  modelSource: string;
}

type PredictionPayload = {
  commodity: string;
  category: string;
  source_centre: string;
  state: string;
  observation_date: string;
  observed_price_per_kg: number;
  predicted_return_7d_pct: number;
  predicted_price_per_kg: number;
  spike_probability: number;
  feature_count: number;
  model_source: string;
};

export async function getLatestPrediction(commodity: string): Promise<ModelPrediction> {
  const response = await fetch(`/api/model/predictions/latest?commodity=${encodeURIComponent(commodity)}`);
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { detail?: unknown } | null;
    const detail = typeof payload?.detail === "string" ? payload.detail : "Local model service is unavailable.";
    throw new Error(detail);
  }
  const payload = await response.json() as PredictionPayload;
  return {
    commodity: payload.commodity,
    category: payload.category,
    sourceCentre: payload.source_centre,
    state: payload.state,
    observationDate: payload.observation_date,
    observedPricePerKg: payload.observed_price_per_kg,
    predictedReturn7dPct: payload.predicted_return_7d_pct,
    predictedPricePerKg: payload.predicted_price_per_kg,
    spikeProbability: payload.spike_probability,
    featureCount: payload.feature_count,
    modelSource: payload.model_source,
  };
}
