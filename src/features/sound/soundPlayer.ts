import type { SoundTheme } from '../../types';
import { getSoundPattern } from './soundThemes';

interface WindowWithLegacyAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export const playAudioDataUrl = async (dataUrl: string): Promise<void> => {
  if (typeof Audio === 'undefined') return;
  const audio = new Audio(dataUrl);
  audio.volume = 0.78;
  audio.currentTime = 0;
  await audio.play().catch(() => undefined);
  window.setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, 2000);
};

export const playTone = (
  theme: SoundTheme,
  variant: 'sound' | 'alert' = 'sound'
): void => {
  if (typeof window === 'undefined') return;
  const AudioContextClass =
    window.AudioContext || (window as WindowWithLegacyAudio).webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const pattern = getSoundPattern(theme, variant);

  pattern.forEach((note) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type =
      theme === 'pulse' || variant === 'alert' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(note.frequency, context.currentTime + note.start);
    gain.gain.setValueAtTime(0.0001, context.currentTime + note.start);
    gain.gain.exponentialRampToValueAtTime(
      note.gain,
      context.currentTime + note.start + 0.03
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + note.start + note.duration
    );
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime + note.start);
    oscillator.stop(context.currentTime + note.start + note.duration + 0.04);
  });

  window.setTimeout(() => {
    void context.close().catch(() => undefined);
  }, 1700);
};

export const playSound = async (
  theme: SoundTheme,
  variant: 'sound' | 'alert' = 'sound',
  customSoundDataUrl?: string
): Promise<void> => {
  if (theme === 'custom' && customSoundDataUrl) {
    await playAudioDataUrl(customSoundDataUrl);
    return;
  }
  playTone(theme, variant);
};

