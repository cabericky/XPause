import { describe, expect, it } from 'vitest';
import {
  defaultStats,
  emptyDaily,
  emptyUsageDay,
  mergeStats,
  recordBreakCompletion,
  recordBreakMiss,
  recordPrompt,
  recordSocialVisit,
  recordUsageTick,
  rollStats,
} from './stats';
import type { ExtensionStats } from '../../types';

describe('analytics stats', () => {
  it('merges partial stats preserving default values', () => {
    const merged = mergeStats({ xp: 250, completed: 3 });
    expect(merged.xp).toBe(250);
    expect(merged.completed).toBe(3);
    expect(merged.daily.xp).toBe(0);
    expect(merged.completedByExercise.blink).toBe(0);
  });

  it('rolls stats when the day changes', () => {
    const yesterday = '2025-01-01';
    const oldStats: ExtensionStats = {
      ...defaultStats,
      daily: {
        ...emptyDaily(yesterday),
        xp: 300,
        completed: 2,
      },
      usage: {
        today: {
          ...emptyUsageDay(yesterday),
          screenMs: 3600000,
        },
        week: {},
      },
    };

    const rolled = rollStats(oldStats);
    expect(rolled.daily.completed).toBe(0);
    expect(rolled.usage.week[yesterday]).toBeDefined();
    expect(rolled.usage.week[yesterday].screenMs).toBe(3600000);
  });

  it('records full and partial break completions properly', () => {
    const fullResult = recordBreakCompletion(defaultStats, 'blink', false);
    expect(fullResult.xpAward).toBe(100);
    expect(fullResult.fatigueReduction).toBe(55);
    expect(fullResult.nextStats.completed).toBe(1);
    expect(fullResult.nextStats.partial).toBe(0);
    expect(fullResult.nextStats.completedByExercise.blink).toBe(1);

    const partialResult = recordBreakCompletion(fullResult.nextStats, 'wrist', true);
    expect(partialResult.xpAward).toBe(50);
    expect(partialResult.fatigueReduction).toBe(28);
    expect(partialResult.nextStats.completed).toBe(1);
    expect(partialResult.nextStats.partial).toBe(1);
    expect(partialResult.nextStats.completedByExercise.wrist).toBe(1);
  });

  it('records break skips and snoozes', () => {
    const skipped = recordBreakMiss(defaultStats, 'skipped');
    expect(skipped.skipped).toBe(1);
    expect(skipped.daily.missed).toBe(1);

    const snoozed = recordBreakMiss(skipped, 'snoozed');
    expect(snoozed.skipped).toBe(1);
    expect(snoozed.daily.missed).toBe(2);
  });

  it('records usage ticks and activity accumulation', () => {
    const tick = recordUsageTick(defaultStats, 'social', 5000, true, true);
    expect(tick.usage.today.screenMs).toBe(5000);
    expect(tick.usage.today.categories.social).toBe(5000);
    expect(tick.usage.today.activeMs).toBe(5000);
    expect(tick.usage.today.passiveMs).toBe(0);
    expect(tick.usage.today.scrollEvents).toBe(1);
  });

  it('records social visits and prompts', () => {
    const visited = recordSocialVisit(defaultStats);
    expect(visited.usage.today.socialVisits).toBe(1);

    const prompted = recordPrompt(visited, 'eyeStrain');
    expect(prompted.usage.today.eyeStrainPrompts).toBe(1);

    const disconnected = recordPrompt(prompted, 'disconnect');
    expect(disconnected.usage.today.disconnectPrompts).toBe(1);
  });
});
