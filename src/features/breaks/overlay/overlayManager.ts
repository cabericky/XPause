import type { BreakUrgency, ExerciseDefinition, ReminderKind, Settings } from '../../../types';
import { resolveTheme } from '../../../shared/utils/theme';
import { playSound } from '../../sound';
import { exercises } from '../exercises';
import { getStepIndex, patchExercisePanel, renderExercisePanelHtml } from './exercisePanel';
import { renderReminderPanelHtml } from './reminderPanel';

export interface BreakOverlayManagerCallbacks {
  getSettings: () => Settings;
  getFatigueScore: () => number;
  getSocialFatigueScore: () => number;
  onBreakCompleted: (exercise: ExerciseDefinition, partial: boolean) => Promise<void> | void;
  onBreakMissed: (kind: 'skipped' | 'snoozed') => Promise<void> | void;
  onNotification?: (message: string) => void;
  onSnooze?: (snoozedUntil: number) => void;
}

export class BreakOverlayManager {
  private mount: HTMLElement;
  private callbacks: BreakOverlayManagerCallbacks;
  private activeExercise: ExerciseDefinition | null = null;
  private activeReminder: ReminderKind | null = null;
  private activeUrgency: BreakUrgency = 'soft';
  private exerciseElapsed = 0;
  private exerciseStartTime = 0;
  private exerciseTimer: number | null = null;
  private snoozedUntil = 0;

  constructor(mount: HTMLElement, callbacks: BreakOverlayManagerCallbacks) {
    this.mount = mount;
    this.callbacks = callbacks;
    this.mount.addEventListener('click', this.handleClick);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  public destroy(): void {
    if (this.exerciseTimer) {
      window.clearInterval(this.exerciseTimer);
      this.exerciseTimer = null;
    }
    this.mount.removeEventListener('click', this.handleClick);
    window.removeEventListener('keydown', this.handleKeyDown);
    this.mount.innerHTML = '';
  }

  public isBusy(): boolean {
    return Boolean(this.activeExercise || this.activeReminder);
  }

  public getActiveExercise(): ExerciseDefinition | null {
    return this.activeExercise;
  }

  public getActiveReminder(): ReminderKind | null {
    return this.activeReminder;
  }

  public isSnoozed(now = Date.now()): boolean {
    return now < this.snoozedUntil;
  }

  public getSnoozedUntil(): number {
    return this.snoozedUntil;
  }

  public setSnoozedUntil(timestamp: number): void {
    this.snoozedUntil = Math.max(this.snoozedUntil, timestamp);
  }

  public closePanel(): void {
    if (this.exerciseTimer) {
      window.clearInterval(this.exerciseTimer);
      this.exerciseTimer = null;
    }
    this.activeExercise = null;
    this.activeUrgency = 'soft';
    this.exerciseElapsed = 0;
    this.mount.innerHTML = '';
  }

  public closeReminder(): void {
    this.activeReminder = null;
    this.mount.innerHTML = '';
  }

  private ensureAttached(): void {
    const rootNode = this.mount.getRootNode();
    if (rootNode instanceof ShadowRoot && rootNode.host) {
      if (!rootNode.host.isConnected && typeof document !== 'undefined') {
        (document.body || document.documentElement).append(rootNode.host);
      }
    }
  }

  public renderReminder(
    kind: ReminderKind,
    urgency: BreakUrgency = 'soft',
    playSoundEffect = true,
  ): void {
    if (this.activeExercise) return;
    this.ensureAttached();

    this.activeReminder = kind;
    this.activeUrgency = urgency;

    const settings = this.callbacks.getSettings();
    if (playSoundEffect && settings.soundEnabled) {
      void playSound(settings.soundTheme, 'alert', settings.customSoundDataUrl);
    }

    const theme = resolveTheme(settings.themeMode);
    const score =
      kind === 'social' ? this.callbacks.getSocialFatigueScore() : this.callbacks.getFatigueScore();

    this.mount.innerHTML = renderReminderPanelHtml(kind, urgency, score, theme);
  }

  public refreshActiveDisplay(): void {
    this.ensureAttached();
    const settings = this.callbacks.getSettings();
    const theme = resolveTheme(settings.themeMode);

    if (this.activeExercise) {
      const stepIndex = getStepIndex(this.activeExercise, this.exerciseElapsed);
      const existingPanel = this.mount.querySelector('.xp-panel') as HTMLElement | null;
      if (
        !existingPanel ||
        !patchExercisePanel(existingPanel, this.activeExercise, stepIndex, this.exerciseElapsed)
      ) {
        this.mount.innerHTML = renderExercisePanelHtml(
          this.activeExercise,
          stepIndex,
          this.exerciseElapsed,
          this.activeUrgency,
          theme,
        );
      }
    } else if (this.activeReminder) {
      const score =
        this.activeReminder === 'social'
          ? this.callbacks.getSocialFatigueScore()
          : this.callbacks.getFatigueScore();
      this.mount.innerHTML = renderReminderPanelHtml(
        this.activeReminder,
        this.activeUrgency,
        score,
        theme,
      );
    }
  }

  public async startBreak(
    urgency: BreakUrgency = 'soft',
    exerciseOverride?: ExerciseDefinition,
    settingsOverride?: Settings,
  ): Promise<void> {
    if (this.activeExercise) return;
    if (this.activeReminder) this.closeReminder();
    this.ensureAttached();

    const currentSettings = settingsOverride ?? this.callbacks.getSettings();
    const enabled = currentSettings.enabledExercises.length
      ? currentSettings.enabledExercises
      : ['blink', 'wrist', 'neck'];
    const chosenId = enabled[Math.floor(Math.random() * enabled.length)];
    this.activeExercise =
      exerciseOverride ?? exercises.find((ex) => ex.id === chosenId) ?? exercises[0];
    this.activeUrgency = urgency;
    this.exerciseElapsed = 0;
    this.exerciseStartTime = Date.now();

    if (currentSettings.soundEnabled) {
      void playSound(currentSettings.soundTheme, 'sound', currentSettings.customSoundDataUrl);
    }

    this.refreshActiveDisplay();

    if (currentSettings.notificationsEnabled && this.callbacks.onNotification) {
      const fatigueScore = this.callbacks.getFatigueScore();
      this.callbacks.onNotification(
        `${this.activeExercise.title} is ready. Your fatigue score is ${fatigueScore}.`,
      );
    }

    this.exerciseTimer = window.setInterval(() => {
      if (!this.activeExercise) return;

      const previousStep = getStepIndex(this.activeExercise, this.exerciseElapsed);
      const elapsedSeconds = Math.floor((Date.now() - this.exerciseStartTime) / 1000);
      this.exerciseElapsed = elapsedSeconds;

      if (
        getStepIndex(this.activeExercise, this.exerciseElapsed) !== previousStep &&
        currentSettings.soundEnabled
      ) {
        void playSound(currentSettings.soundTheme, 'sound', currentSettings.customSoundDataUrl);
      }

      if (this.exerciseElapsed >= this.activeExercise.duration) {
        const finished = this.activeExercise;
        this.closePanel();
        void this.callbacks.onBreakCompleted(finished, false);
      } else {
        this.refreshActiveDisplay();
      }
    }, 1000);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;

    if (this.activeReminder) {
      void this.callbacks.onBreakMissed('skipped');
      this.closeReminder();
    } else if (this.activeExercise) {
      void this.callbacks.onBreakMissed('skipped');
      this.closePanel();
    }
  };

  private handleClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    const action = target?.dataset.action;
    if (!action) return;

    if (this.activeReminder) {
      if (action === 'start-reset') {
        const urgency = this.activeUrgency;
        this.closeReminder();
        void this.startBreak(urgency);
      } else if (action === 'disconnect') {
        this.snoozedUntil = Date.now() + 15 * 60_000;
        this.callbacks.onSnooze?.(this.snoozedUntil);
        this.closeReminder();
      } else if (action === 'reminder-snooze') {
        this.snoozedUntil = Date.now() + 10 * 60_000;
        this.callbacks.onSnooze?.(this.snoozedUntil);
        this.closeReminder();
      } else if (action === 'reminder-dismiss') {
        void this.callbacks.onBreakMissed('skipped');
        this.closeReminder();
      }
      return;
    }

    if (!this.activeExercise) return;

    if (action === 'close') {
      void this.callbacks.onBreakMissed('skipped');
      this.closePanel();
    } else if (action === 'done') {
      const finished = this.activeExercise;
      const partial = this.exerciseElapsed < this.activeExercise.duration * 0.75;
      this.closePanel();
      void this.callbacks.onBreakCompleted(finished, partial);
    } else if (action === 'skip') {
      void this.callbacks.onBreakMissed('skipped');
      this.closePanel();
    } else if (action === 'snooze') {
      this.snoozedUntil = Date.now() + 10 * 60_000;
      this.callbacks.onSnooze?.(this.snoozedUntil);
      void this.callbacks.onBreakMissed('snoozed');
      this.closePanel();
    }
  };
}
