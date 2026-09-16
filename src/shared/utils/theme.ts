import type { ThemeMode } from '../../types';

export const resolveTheme = (
  themeMode: ThemeMode,
  systemPrefersDark?: boolean
): 'light' | 'dark' => {
  if (themeMode !== 'system') return themeMode;
  if (typeof systemPrefersDark === 'boolean') {
    return systemPrefersDark ? 'dark' : 'light';
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

