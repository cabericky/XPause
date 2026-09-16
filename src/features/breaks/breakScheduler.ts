import type { BreakUrgency, UsageCategory } from '../../types';

export type PromptDecision =
  | { type: 'eyeStrain' }
  | { type: 'social' }
  | { type: 'fatigue'; urgency: BreakUrgency };

export interface ScheduleEvaluationContext {
  eyeStrainMinutes: number;
  socialFatigueScore: number;
  category: UsageCategory;
  urgency: BreakUrgency;
  isSnoozed: boolean;
  isBusy: boolean;
  now?: number;
}

export class BreakScheduler {
  private lastEyePromptAt = 0;
  private lastDisconnectPromptAt = 0;
  private lastFatiguePromptAt = 0;

  public evaluate(context: ScheduleEvaluationContext): PromptDecision | null {
    if (context.isBusy) return null;

    const now = context.now ?? Date.now();

    // 1. Eye-strain reset check (20-20-20 rule)
    if (
      context.eyeStrainMinutes >= 20 &&
      now - this.lastEyePromptAt > 20 * 60_000
    ) {
      this.lastEyePromptAt = now;
      return { type: 'eyeStrain' };
    }

    // 2. Social media disconnect threshold
    if (
      context.socialFatigueScore >= 70 &&
      context.category === 'social' &&
      !context.isSnoozed &&
      now - this.lastDisconnectPromptAt > 15 * 60_000
    ) {
      this.lastDisconnectPromptAt = now;
      return { type: 'social' };
    }

    // 3. General fatigue urgency threshold
    if (
      context.urgency !== 'none' &&
      !context.isSnoozed &&
      now - this.lastFatiguePromptAt > 10 * 60_000
    ) {
      this.lastFatiguePromptAt = now;
      return { type: 'fatigue', urgency: context.urgency };
    }

    return null;
  }

  public reset(): void {
    this.lastEyePromptAt = 0;
    this.lastDisconnectPromptAt = 0;
    this.lastFatiguePromptAt = 0;
  }
}

