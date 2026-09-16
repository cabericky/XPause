import type { SoundTheme } from '../../types';

export interface SoundNote {
  frequency: number;
  start: number;
  duration: number;
  gain: number;
}

export const soundThemes: Array<{ id: Exclude<SoundTheme, 'custom'>; label: string; description: string }> = [
  { id: 'soft', label: 'Soft', description: 'A calm single cue' },
  { id: 'chime', label: 'Chime', description: 'Two bright notes' },
  { id: 'pulse', label: 'Pulse', description: 'A firmer reminder' }
];

export const getSoundPattern = (theme: SoundTheme, variant: 'sound' | 'alert' = 'sound'): SoundNote[] => {
  const lift = variant === 'alert' ? 120 : 0;
  const patterns: Record<Exclude<SoundTheme, 'custom'>, SoundNote[]> = {
    soft: [
      { frequency: 520 + lift, start: 0, duration: 0.34, gain: 0.026 },
      { frequency: 660 + lift, start: 0.42, duration: 0.42, gain: 0.02 }
    ],
    chime: [
      { frequency: 620 + lift, start: 0, duration: 0.24, gain: 0.024 },
      { frequency: 820 + lift, start: 0.28, duration: 0.28, gain: 0.022 },
      { frequency: 980 + lift, start: 0.62, duration: 0.38, gain: 0.018 }
    ],
    pulse: [
      { frequency: 420 + lift, start: 0, duration: 0.18, gain: 0.028 },
      { frequency: 420 + lift, start: 0.28, duration: 0.18, gain: 0.026 },
      { frequency: 560 + lift, start: 0.58, duration: 0.28, gain: 0.022 }
    ]
  };
  return theme === 'custom' ? patterns.soft : patterns[theme];
};

