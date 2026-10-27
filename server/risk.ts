export type RiskInputs = {
  hazardCount: number;
  nearMisses: number;
  workerDensity: number;
  cameraReliability: number;
  lighting: number;
  restrictedZoneExposure: number;
};

export type RiskResult = {
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  reliability: number;
  reasons: string[];
  disclaimer: string;
};

/** Transparent illustrative heuristic; it is not a trained/validated safety model. */
export function calculateBaselineRisk(input: RiskInputs): RiskResult {
  const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, Number.isFinite(v) ? v : min));
  const score = Math.round(clamp(
    input.hazardCount * 9 + input.nearMisses * 13 + input.workerDensity * 0.22 +
    input.restrictedZoneExposure * 0.32 + (100 - input.lighting) * 0.12 + (100 - input.cameraReliability) * 0.15,
  ));
  const level: RiskResult['level'] = score >= 75 ? 'CRITICAL' : score >= 55 ? 'HIGH' : score >= 30 ? 'MODERATE' : 'LOW';
  const reasons: string[] = [];
  if (input.hazardCount > 0) reasons.push(`${input.hazardCount} hazard signal(s) reported`);
  if (input.nearMisses > 0) reasons.push(`${input.nearMisses} near-miss record(s) require review`);
  if (input.restrictedZoneExposure > 30) reasons.push('Restricted-zone exposure is elevated');
  if (input.lighting < 50) reasons.push('Low lighting may reduce observation quality');
  if (input.cameraReliability < 70) reasons.push('Camera reliability is degraded; observability is reduced');
  if (!reasons.length) reasons.push('No elevated input signal in this illustrative snapshot');
  return {
    score,
    level,
    reliability: Math.round(clamp(input.cameraReliability * 0.65 + input.lighting * 0.35)),
    reasons,
    disclaimer: 'Illustrative rules-based demo only; not empirically validated and not a substitute for a competent safety assessment.',
  };
}
