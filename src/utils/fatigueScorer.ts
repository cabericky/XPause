import type { ActivitySignals, BreakUrgency, FatigueResult, Sensitivity } from '../types';

const sensitivityThresholds: Record<Sensitivity, { soft: number; urgent: number; critical: number }> = {
  low: { soft: 70, urgent: 90, critical: 96 },
  medium: { soft: 60, urgent: 85, critical: 94 },
  high: { soft: 48, urgent: 76, critical: 90 }
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export const getUrgency = (score: number, sensitivity: Sensitivity): BreakUrgency => {
  const thresholds = sensitivityThresholds[sensitivity];
  if (score >= thresholds.critical) return 'critical';
  if (score >= thresholds.urgent) return 'urgent';
  if (score >= thresholds.soft) return 'soft';
  return 'none';
};

export const scoreActivity = (
  signals: ActivitySignals,
  previousScore: number,
  sensitivity: Sensitivity
): FatigueResult => {
  const reasons: string[] = [];
  const sessionPressure = Math.min(signals.continuousUseMinutes * 1.55, 42);
  const typingPressure = Math.min(signals.keypressesPerMinute / 2.5 + signals.typingBurstCount * 1.8, 20);
  const mousePressure = Math.min(signals.mouseVelocity / 46, 14);
  const scrollPressure = Math.min(signals.scrollVelocity / 30 + signals.scrollDepth / 11, 16);
  const visibilityPressure = Math.min(signals.visibilityChanges * 1.8, 8);

  if (signals.continuousUseMinutes >= 25) reasons.push('Long continuous focus session');
  if (signals.keypressesPerMinute > 70) reasons.push('Sustained typing intensity');
  if (signals.mouseVelocity > 420) reasons.push('High pointer movement');
  if (signals.scrollVelocity > 260) reasons.push('Rapid scrolling pattern');
  if (signals.visibilityChanges >= 4) reasons.push('Frequent context switching');

  const exertion =
    sessionPressure + typingPressure + mousePressure + scrollPressure + visibilityPressure;
  const idleRecovery = signals.idleMs > 45_000 ? Math.min(signals.idleMs / 20_000, 16) : 0;
  const momentum = previousScore * 0.72 + exertion * 0.28;
  const score = clamp(momentum - idleRecovery);

  if (idleRecovery > 4) reasons.push('Idle recovery detected');

  return {
    score: Math.round(score),
    urgency: getUrgency(score, sensitivity),
    reasons
  };
};

export const decayFatigue = (score: number, idleMs: number): number => {
  if (idleMs < 30_000) return score;
  return Math.round(clamp(score - Math.min(idleMs / 12_000, 24)));
};
