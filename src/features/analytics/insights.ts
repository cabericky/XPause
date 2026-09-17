import type { InsightSnapshot, UsageCategory, UsageDay } from '../../types';

export const defaultInsights: InsightSnapshot = {
  socialFatigueScore: 0,
  eyeStrainMinutes: 0,
  category: 'work',
  passiveRatio: 0,
  schedule: ['Open a normal web page to begin learning your rhythm.'],
  disconnectSuggestion: 'No disconnect needed yet.',
  updatedAt: Date.now(),
};

export const buildInsights = (
  usage: UsageDay,
  category: UsageCategory,
  eyeStrainMinutes: number,
  socialFatigueScore: number,
): InsightSnapshot => {
  const passiveRatio = usage.screenMs > 0 ? usage.passiveMs / usage.screenMs : 0;
  const socialMinutes = Math.round(usage.categories.social / 60_000);
  const entertainmentMinutes = Math.round(usage.categories.entertainment / 60_000);
  const schedule = [
    eyeStrainMinutes >= 20
      ? 'Run a 20-20-20 eye reset now.'
      : `Next eye reset in ${Math.max(1, 20 - eyeStrainMinutes)} min.`,
    passiveRatio > 0.62
      ? 'Use shorter 8-12 minute browsing blocks with a hard stop.'
      : 'Keep the next focus block around 25 minutes.',
    socialMinutes > 30 || socialFatigueScore >= 65
      ? 'Take a 15 minute social disconnect before returning.'
      : entertainmentMinutes > 45
        ? 'Switch to a work or recovery tab before more entertainment.'
        : 'Micro-break timing looks balanced.',
  ];

  return {
    socialFatigueScore,
    eyeStrainMinutes,
    category,
    passiveRatio,
    schedule,
    disconnectSuggestion:
      socialFatigueScore >= 75
        ? 'Disconnect strongly recommended.'
        : socialFatigueScore >= 55
          ? 'Consider closing social tabs for one focus block.'
          : 'No disconnect needed yet.',
    updatedAt: Date.now(),
  };
};
