import type { BreakUrgency } from '../activity/types';
import type { ExerciseId } from '../breaks/types';

export type UsageCategory = 'work' | 'entertainment' | 'social';

export interface DailyStats {
  date: string;
  xp: number;
  completed: number;
  partial: number;
  skipped: number;
  missed: number;
  blink: number;
  wrist: number;
  neck: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface UsageDay {
  date: string;
  screenMs: number;
  activeMs: number;
  passiveMs: number;
  categories: Record<UsageCategory, number>;
  socialVisits: number;
  scrollEvents: number;
  disconnectPrompts: number;
  eyeStrainPrompts: number;
}

export interface UsageAnalytics {
  today: UsageDay;
  week: Record<string, UsageDay>;
}

export interface InsightSnapshot {
  socialFatigueScore: number;
  eyeStrainMinutes: number;
  category: UsageCategory;
  passiveRatio: number;
  schedule: string[];
  disconnectSuggestion: string;
  updatedAt: number;
}

export interface ExtensionStats {
  xp: number;
  completed: number;
  partial: number;
  skipped: number;
  daily: DailyStats;
  completedByExercise: Record<ExerciseId, number>;
  usage: UsageAnalytics;
}

export interface ExtensionRuntime {
  fatigueScore: number;
  urgency: BreakUrgency;
  reasons: string[];
  updatedAt: number;
  eyeStrainStartedAt?: number;
  snoozedUntil?: number;
}
