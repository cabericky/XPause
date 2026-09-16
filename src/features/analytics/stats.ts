import type {
  DailyStats,
  ExerciseId,
  ExtensionStats,
  UsageCategory,
  UsageDay
} from '../../types';
import { today } from '../../shared/utils/date';

export const emptyDaily = (date = today()): DailyStats => ({
  date,
  xp: 0,
  completed: 0,
  partial: 0,
  skipped: 0,
  missed: 0,
  blink: 0,
  wrist: 0,
  neck: 0
});

export const emptyUsageDay = (date = today()): UsageDay => ({
  date,
  screenMs: 0,
  activeMs: 0,
  passiveMs: 0,
  categories: { work: 0, entertainment: 0, social: 0 },
  socialVisits: 0,
  scrollEvents: 0,
  disconnectPrompts: 0,
  eyeStrainPrompts: 0
});

export const defaultStats: ExtensionStats = {
  xp: 0,
  completed: 0,
  partial: 0,
  skipped: 0,
  daily: emptyDaily(),
  completedByExercise: { blink: 0, wrist: 0, neck: 0 },
  usage: {
    today: emptyUsageDay(),
    week: {}
  }
};

export const mergeStats = (
  value: Partial<ExtensionStats> | undefined
): ExtensionStats => ({
  ...defaultStats,
  ...value,
  daily: { ...defaultStats.daily, ...value?.daily },
  completedByExercise: {
    ...defaultStats.completedByExercise,
    ...value?.completedByExercise
  },
  usage: {
    today: { ...defaultStats.usage.today, ...value?.usage?.today },
    week: value?.usage?.week ?? {}
  }
});

export const rollStats = (stats: ExtensionStats): ExtensionStats => {
  const todayDate = today();
  const currentUsage = stats.usage?.today ?? emptyUsageDay(todayDate);
  const week = { ...(stats.usage?.week ?? {}) };

  if (currentUsage.date && currentUsage.date !== todayDate) {
    week[currentUsage.date] = currentUsage;
  }

  const recentWeek = Object.fromEntries(
    Object.entries(week)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-365)
  ) as Record<string, UsageDay>;

  return {
    ...stats,
    daily: stats.daily.date === todayDate ? stats.daily : emptyDaily(todayDate),
    usage: {
      today: currentUsage.date === todayDate ? currentUsage : emptyUsageDay(todayDate),
      week: recentWeek
    }
  };
};

export interface BreakCompletionResult {
  nextStats: ExtensionStats;
  xpAward: number;
  fatigueReduction: number;
}

export const recordBreakCompletion = (
  stats: ExtensionStats,
  exerciseId: ExerciseId,
  partial: boolean
): BreakCompletionResult => {
  const rolled = rollStats(stats);
  const xpAward = partial ? 50 : 100;
  const fatigueReduction = partial ? 28 : 55;

  const nextStats: ExtensionStats = {
    ...rolled,
    xp: rolled.xp + xpAward,
    completed: rolled.completed + (partial ? 0 : 1),
    partial: rolled.partial + (partial ? 1 : 0),
    daily: {
      ...rolled.daily,
      xp: rolled.daily.xp + xpAward,
      completed: rolled.daily.completed + (partial ? 0 : 1),
      partial: rolled.daily.partial + (partial ? 1 : 0),
      [exerciseId]: rolled.daily[exerciseId] + 1
    },
    completedByExercise: {
      ...rolled.completedByExercise,
      [exerciseId]: rolled.completedByExercise[exerciseId] + 1
    }
  };

  return { nextStats, xpAward, fatigueReduction };
};

export const recordBreakMiss = (
  stats: ExtensionStats,
  kind: 'skipped' | 'snoozed'
): ExtensionStats => {
  const rolled = rollStats(stats);
  return {
    ...rolled,
    skipped: rolled.skipped + (kind === 'skipped' ? 1 : 0),
    daily: {
      ...rolled.daily,
      skipped: rolled.daily.skipped + (kind === 'skipped' ? 1 : 0),
      missed: rolled.daily.missed + 1
    }
  };
};

export const recordUsageTick = (
  stats: ExtensionStats,
  category: UsageCategory,
  tickMs: number,
  isActive: boolean,
  hasScrollEvent: boolean
): ExtensionStats => {
  const rolled = rollStats(stats);
  const todayUsage = { ...rolled.usage.today };

  todayUsage.screenMs += tickMs;
  todayUsage.categories = {
    ...todayUsage.categories,
    [category]: todayUsage.categories[category] + tickMs
  };
  todayUsage.activeMs += isActive ? tickMs : 0;
  todayUsage.passiveMs += isActive ? 0 : tickMs;
  todayUsage.scrollEvents += hasScrollEvent ? 1 : 0;

  return {
    ...rolled,
    usage: {
      ...rolled.usage,
      today: todayUsage
    }
  };
};

export const recordSocialVisit = (stats: ExtensionStats): ExtensionStats => {
  const rolled = rollStats(stats);
  return {
    ...rolled,
    usage: {
      ...rolled.usage,
      today: {
        ...rolled.usage.today,
        socialVisits: rolled.usage.today.socialVisits + 1
      }
    }
  };
};

export const recordPrompt = (
  stats: ExtensionStats,
  kind: 'eyeStrain' | 'disconnect'
): ExtensionStats => {
  const rolled = rollStats(stats);
  return {
    ...rolled,
    usage: {
      ...rolled.usage,
      today: {
        ...rolled.usage.today,
        eyeStrainPrompts:
          rolled.usage.today.eyeStrainPrompts + (kind === 'eyeStrain' ? 1 : 0),
        disconnectPrompts:
          rolled.usage.today.disconnectPrompts + (kind === 'disconnect' ? 1 : 0)
      }
    }
  };
};
