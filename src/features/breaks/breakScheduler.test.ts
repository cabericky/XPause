import { describe, expect, it } from 'vitest';
import { BreakScheduler } from './breakScheduler';

describe('BreakScheduler', () => {
  it('returns null when busy with another exercise or reminder', () => {
    const scheduler = new BreakScheduler();
    const decision = scheduler.evaluate({
      eyeStrainMinutes: 30,
      socialFatigueScore: 85,
      category: 'social',
      urgency: 'critical',
      isSnoozed: false,
      isBusy: true,
    });
    expect(decision).toBeNull();
  });

  it('triggers eye strain prompt after 20 minutes', () => {
    const scheduler = new BreakScheduler();
    const decision = scheduler.evaluate({
      eyeStrainMinutes: 20,
      socialFatigueScore: 20,
      category: 'work',
      urgency: 'none',
      isSnoozed: false,
      isBusy: false,
    });
    expect(decision).toEqual({ type: 'eyeStrain' });

    // Cooldown prevents immediate re-prompting
    const followUp = scheduler.evaluate({
      eyeStrainMinutes: 21,
      socialFatigueScore: 20,
      category: 'work',
      urgency: 'none',
      isSnoozed: false,
      isBusy: false,
    });
    expect(followUp).toBeNull();
  });

  it('triggers social disconnect prompt on high social fatigue', () => {
    const scheduler = new BreakScheduler();
    const decision = scheduler.evaluate({
      eyeStrainMinutes: 10,
      socialFatigueScore: 75,
      category: 'social',
      urgency: 'none',
      isSnoozed: false,
      isBusy: false,
    });
    expect(decision).toEqual({ type: 'social' });
  });

  it('triggers fatigue break when urgency is not none', () => {
    const scheduler = new BreakScheduler();
    const decision = scheduler.evaluate({
      eyeStrainMinutes: 5,
      socialFatigueScore: 20,
      category: 'work',
      urgency: 'urgent',
      isSnoozed: false,
      isBusy: false,
    });
    expect(decision).toEqual({ type: 'fatigue', urgency: 'urgent' });
  });

  it('respects snoozed state for eye-strain, fatigue, and social reminders', () => {
    const scheduler = new BreakScheduler();
    const eyeDecision = scheduler.evaluate({
      eyeStrainMinutes: 25,
      socialFatigueScore: 20,
      category: 'work',
      urgency: 'none',
      isSnoozed: true,
      isBusy: false,
    });
    expect(eyeDecision).toBeNull();

    const socialDecision = scheduler.evaluate({
      eyeStrainMinutes: 5,
      socialFatigueScore: 80,
      category: 'social',
      urgency: 'urgent',
      isSnoozed: true,
      isBusy: false,
    });
    expect(socialDecision).toBeNull();
  });
});
