export type Sensitivity = 'low' | 'medium' | 'high';
export type BreakUrgency = 'none' | 'soft' | 'urgent' | 'critical';

export interface ActivitySignals {
  mouseVelocity: number;
  idleMs: number;
  keypressesPerMinute: number;
  typingBurstCount: number;
  scrollVelocity: number;
  scrollDepth: number;
  visibilityChanges: number;
  continuousUseMinutes: number;
}

export interface FatigueResult {
  score: number;
  urgency: BreakUrgency;
  reasons: string[];
}
