export type ExerciseId = 'blink' | 'wrist' | 'neck';
export type ReminderKind = 'fatigue' | 'social';

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

