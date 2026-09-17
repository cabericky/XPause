import type { Sensitivity } from '../activity/types';
import type { ExerciseId } from '../breaks/types';
import type { SoundTheme } from '../sound/types';

export type ThemeMode = 'light' | 'dark' | 'system';

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
