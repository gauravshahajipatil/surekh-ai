import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBaselineRisk } from '../server/risk.js';

test('risk baseline is deterministic for the same input', () => {
  const input = { hazardCount: 2, nearMisses: 1, workerDensity: 65, cameraReliability: 72, lighting: 68, restrictedZoneExposure: 38 };
  assert.deepEqual(calculateBaselineRisk(input), calculateBaselineRisk(input));
});

test('risk score remains bounded and reliability is explicit', () => {
  const result = calculateBaselineRisk({ hazardCount: 1000, nearMisses: 900, workerDensity: 5000, cameraReliability: 0, lighting: 0, restrictedZoneExposure: 1000 });
  assert.equal(result.score, 100);
  assert.equal(result.reliability, 0);
  assert.equal(result.level, 'CRITICAL');
});

test('risk calculation explains reduced observability when camera reliability is low', () => {
  const result = calculateBaselineRisk({ hazardCount: 0, nearMisses: 0, workerDensity: 0, cameraReliability: 20, lighting: 80, restrictedZoneExposure: 0 });
  assert.ok(result.reasons.some(reason => reason.includes('Camera reliability is degraded')));
  assert.match(result.disclaimer, /not empirically validated/i);
});

test('risk labels use thresholds for low and high levels', () => {
  const low = calculateBaselineRisk({ hazardCount: 0, nearMisses: 0, workerDensity: 0, cameraReliability: 100, lighting: 100, restrictedZoneExposure: 0 });
  const high = calculateBaselineRisk({ hazardCount: 6, nearMisses: 2, workerDensity: 100, cameraReliability: 90, lighting: 90, restrictedZoneExposure: 50 });
  assert.equal(low.level, 'LOW');
  assert.ok(['HIGH', 'CRITICAL'].includes(high.level));
});
