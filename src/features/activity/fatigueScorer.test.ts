import { describe, expect, it } from 'vitest';
import { calculateSocialFatigue, decayFatigue, emptySignals, scoreActivity } from './fatigueScorer';
import type { ActivitySignals } from '../../types';

const baseSignals: ActivitySignals = emptySignals();

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
        continuousUseMinutes: 38,
      },
      90,
      'medium',
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

  it('calculates social fatigue and decays after stepping away from social media', () => {
    const activeSocialScore = calculateSocialFatigue(30, 0.6, 20, 0);
    expect(activeSocialScore).toBeGreaterThanOrEqual(60);

    const recoveredSocialScore = calculateSocialFatigue(30, 0.6, 20, 30);
    expect(recoveredSocialScore).toBeLessThan(activeSocialScore);
  });

  it('adjusts session pressure when sessionLengthMinutes is customized', () => {
    const standard = scoreActivity({ ...baseSignals, continuousUseMinutes: 15 }, 0, 'medium', 25);
    const customized = scoreActivity({ ...baseSignals, continuousUseMinutes: 15 }, 0, 'medium', 15);
    expect(customized.score).toBeGreaterThan(standard.score);
    expect(customized.reasons).toContain('Long continuous focus session');
    expect(standard.reasons).not.toContain('Long continuous focus session');
  });
});
