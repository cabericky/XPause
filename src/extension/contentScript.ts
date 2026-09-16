import type { BreakUrgency, ExerciseDefinition, ExtensionStats } from '../types';
import {
  ActivityTracker,
  calculateSocialFatigue,
  clamp,
  classifyHost,
  getUrgency,
  scoreActivity
} from '../features/activity';
import {
  buildInsights,
  defaultStats,
  mergeStats,
  recordBreakCompletion,
  recordBreakMiss,
  recordPrompt,
  recordSocialVisit,
  recordUsageTick
} from '../features/analytics';
import {
  BreakOverlayManager,
  BreakScheduler,
  exercises,
  initOverlayHost
} from '../features/breaks';
import { defaultSettings } from '../features/settings';
import { getStorage, readStorage, setStorage } from '../shared/storage/storage';
import {
  type ExtensionMessage,
  sendNotificationMessage
} from '../shared/messaging/messages';

const saveRuntime = async (
  score: number,
  urgency: BreakUrgency,
  reasons: string[]
): Promise<void> => {
  await setStorage({
    xpauseRuntime: {
      fatigueScore: score,
      urgency,
      reasons: reasons.length ? reasons : ['Activity is currently balanced'],
      updatedAt: Date.now()
    }
  });
};

const install = (): void => {
  const hostElements = initOverlayHost();
  if (!hostElements) return;

  const category = classifyHost(location.hostname);
  const tracker = new ActivityTracker(category);
  tracker.init();

  const scheduler = new BreakScheduler();
  let fatigueScore = 0;
  let socialFatigueScore = 0;
  let currentSettings = defaultSettings;
  let lastTickAt = Date.now();
  let eyeStrainStartedAt = Date.now();

  const saveCompletion = async (
    exercise: ExerciseDefinition,
    partial: boolean
  ): Promise<void> => {
    const rawStored = (await getStorage('xpauseStats')).xpauseStats as
      | Partial<ExtensionStats>
      | undefined;
    const { nextStats, fatigueReduction } = recordBreakCompletion(
      mergeStats(rawStored),
      exercise.id,
      partial
    );

    fatigueScore = Math.max(0, fatigueScore - fatigueReduction);
    tracker.resetSession();
    eyeStrainStartedAt = Date.now();

    await setStorage({ xpauseStats: nextStats });
    await saveRuntime(fatigueScore, 'none', ['Break completed']);
  };

  const saveMiss = async (kind: 'skipped' | 'snoozed'): Promise<void> => {
    const rawStored = (await getStorage('xpauseStats')).xpauseStats as
      | Partial<ExtensionStats>
      | undefined;
    const nextStats = recordBreakMiss(mergeStats(rawStored), kind);
    await setStorage({ xpauseStats: nextStats });
  };

  const overlayManager = new BreakOverlayManager(hostElements.mount, {
    getSettings: () => currentSettings,
    getFatigueScore: () => fatigueScore,
    getSocialFatigueScore: () => socialFatigueScore,
    onBreakCompleted: saveCompletion,
    onBreakMissed: saveMiss,
    onNotification: sendNotificationMessage
  });

  if (category === 'social') {
    void (async () => {
      const rawStored = (await getStorage('xpauseStats')).xpauseStats as
        | Partial<ExtensionStats>
        | undefined;
      await setStorage({ xpauseStats: recordSocialVisit(mergeStats(rawStored)) });
    })();
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (!message || typeof message !== 'object' || !('type' in message)) return;

    const typedMessage = message as ExtensionMessage;
    if (typedMessage.type === 'XP_PAUSE_START_BREAK') {
      if (typedMessage.settings) currentSettings = typedMessage.settings;
      void overlayManager.startBreak('soft', undefined, typedMessage.settings);
    }

    if (typedMessage.type === 'XP_PAUSE_SETTINGS_UPDATED') {
      if (typedMessage.settings) {
        currentSettings = typedMessage.settings;
        overlayManager.refreshActiveDisplay();
      } else {
        void readStorage('xpauseSettings', defaultSettings).then((settings) => {
          currentSettings = settings;
          overlayManager.refreshActiveDisplay();
        });
      }
    }
  });

  window.setInterval(() => {
    void (async () => {
      if (document.hidden) {
        lastTickAt = Date.now();
        return;
      }

      currentSettings = await readStorage('xpauseSettings', defaultSettings);
      const now = Date.now();
      const tickMs = Math.max(0, Math.min(now - lastTickAt, 10_000));
      lastTickAt = now;

      const snapshot = tracker.getSnapshot(now);
      if (snapshot.idleMs > 5 * 60_000) {
        eyeStrainStartedAt = now;
      }

      const result = scoreActivity(
        snapshot.signals,
        fatigueScore,
        currentSettings.sensitivity
      );

      fatigueScore =
        snapshot.idleMs > 30_000
          ? Math.round(clamp(fatigueScore - Math.min(snapshot.idleMs / 12_000, 24)))
          : result.score;

      const rawStored = (await getStorage('xpauseStats')).xpauseStats as
        | Partial<ExtensionStats>
        | undefined;
      let stored = recordUsageTick(
        mergeStats(rawStored ?? defaultStats),
        category,
        tickMs,
        snapshot.isActive,
        snapshot.signals.scrollVelocity > 80
      );

      const socialMinutes = stored.usage.today.categories.social / 60_000;
      const passiveRatio =
        stored.usage.today.screenMs > 0
          ? stored.usage.today.passiveMs / stored.usage.today.screenMs
          : 0;

      socialFatigueScore = calculateSocialFatigue(
        socialMinutes,
        passiveRatio,
        stored.usage.today.scrollEvents,
        snapshot.minutesSinceSocialActive
      );

      const eyeStrainMinutes = Math.floor((now - eyeStrainStartedAt) / 60_000);
      const insights = buildInsights(
        stored.usage.today,
        category,
        eyeStrainMinutes,
        socialFatigueScore
      );

      const urgency =
        snapshot.idleMs > 30_000
          ? getUrgency(fatigueScore, currentSettings.sensitivity)
          : result.urgency;

      const prompt = scheduler.evaluate({
        eyeStrainMinutes,
        socialFatigueScore,
        category,
        urgency,
        isSnoozed: overlayManager.isSnoozed(now),
        isBusy: overlayManager.isBusy(),
        now
      });

      if (prompt?.type === 'eyeStrain') {
        stored = recordPrompt(stored, 'eyeStrain');
        void overlayManager.startBreak('soft', exercises[0]);
      } else if (prompt?.type === 'social') {
        stored = recordPrompt(stored, 'disconnect');
        overlayManager.renderReminder('social', 'urgent');
        if (currentSettings.notificationsEnabled) {
          sendNotificationMessage(
            'Social fatigue is high. Consider disconnecting for 15 minutes.'
          );
        }
      } else if (prompt?.type === 'fatigue') {
        overlayManager.renderReminder('fatigue', prompt.urgency);
      }

      await setStorage({ xpauseStats: stored, xpauseInsights: insights });
      await saveRuntime(fatigueScore, urgency, result.reasons);

      tracker.decay();
    })();
  }, 5_000);
};

install();
