import type { ExerciseDefinition } from '../types';

export const exercises: ExerciseDefinition[] = [
  {
    id: 'blink',
    title: 'Blink Exercise',
    shortLabel: 'Eyes',
    duration: 60,
    xp: 100,
    accent: '#7EC8A4',
    steps: [
      { label: 'Look 20 feet away', duration: 20, cue: 'Relax your gaze into the distance.' },
      { label: 'Slow blink set', duration: 20, cue: 'Close, release, and reopen your eyes.' },
      { label: 'Soft focus reset', duration: 20, cue: 'Let your eyes rest before returning.' }
    ]
  },
  {
    id: 'wrist',
    title: 'Wrist Stretch',
    shortLabel: 'Wrists',
    duration: 75,
    xp: 100,
    accent: '#8FBFE0',
    steps: [
      { label: 'Gentle rotations', duration: 25, cue: 'Circle both wrists slowly.' },
      { label: 'Palm flex', duration: 25, cue: 'Press fingers back with an easy stretch.' },
      { label: 'Release shakeout', duration: 25, cue: 'Shake the hands loose.' }
    ]
  },
  {
    id: 'neck',
    title: 'Neck Rotation',
    shortLabel: 'Neck',
    duration: 90,
    xp: 100,
    accent: '#E8C77D',
    steps: [
      { label: 'Turn left and hold', duration: 30, cue: 'Keep shoulders low and jaw relaxed.' },
      { label: 'Turn right and hold', duration: 30, cue: 'Move slowly through the center.' },
      { label: 'Forward release', duration: 30, cue: 'Drop chin gently and breathe.' }
    ]
  }
];

export const getExerciseById = (id: string) => exercises.find((exercise) => exercise.id === id);
