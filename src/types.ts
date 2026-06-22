export type Sensitivity = 'low' | 'medium' | 'high';
export type BreakUrgency = 'none' | 'soft' | 'urgent' | 'critical';
export type ExerciseId = 'blink' | 'wrist' | 'neck';
export type SoundTheme = 'soft' | 'chime' | 'pulse' | 'custom';
export type ThemeMode = 'light' | 'dark' | 'system';

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

export interface ExerciseStep {
  label: string;
  duration: number;
  cue: string;
}

export interface ExerciseDefinition {
  id: ExerciseId;
  title: string;
  shortLabel: string;
  duration: number;
  xp: number;
  accent: string;
  steps: ExerciseStep[];
}

export interface Settings {
  sessionLengthMinutes: number;
  sensitivity: Sensitivity;
  enabledExercises: ExerciseId[];
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  soundTheme: SoundTheme;
  customSoundDataUrl?: string;
  customSoundName?: string;
  themeMode: ThemeMode;
  dailyBreakGoal: number;
}

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
