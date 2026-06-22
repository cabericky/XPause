import { describe, expect, it } from 'vitest';
import { decayFatigue, scoreActivity } from './fatigueScorer';
import type { ActivitySignals } from '../types';

const baseSignals: ActivitySignals = {
  mouseVelocity: 0,
  idleMs: 0,
  keypressesPerMinute: 0,
  typingBurstCount: 0,
  scrollVelocity: 0,
  scrollDepth: 0,
  visibilityChanges: 0,
  continuousUseMinutes: 0
};

describe('fatigueScorer', () => {
  it('raises score when multiple work intensity signals are present', () => {
    const result = scoreActivity(
      {
        ...baseSignals,
        mouseVelocity: 520,
        keypressesPerMinute: 88,
        typingBurstCount: 4,
        scrollVelocity: 340,
        scrollDepth: 85,
        continuousUseMinutes: 38
      },
      90,
      'medium'
    );

    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.urgency).toBe('urgent');
    expect(result.reasons).toContain('Long continuous focus session');
  });

  it('recovers fatigue during genuine idle periods', () => {
    expect(decayFatigue(80, 180_000)).toBeLessThan(70);
  });

  it('uses lower thresholds for high sensitivity', () => {
    const result = scoreActivity({ ...baseSignals, continuousUseMinutes: 60 }, 52, 'high');
    expect(result.urgency).toBe('soft');
  });
});
