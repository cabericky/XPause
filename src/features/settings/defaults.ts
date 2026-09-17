import type { Settings } from '../../types';

export const defaultSettings: Settings = {
  sessionLengthMinutes: 25,
  sensitivity: 'medium',
  enabledExercises: ['blink', 'wrist', 'neck'],
  soundEnabled: true,
  notificationsEnabled: false,
  soundTheme: 'soft',
  themeMode: 'light',
  dailyBreakGoal: 4,
};
