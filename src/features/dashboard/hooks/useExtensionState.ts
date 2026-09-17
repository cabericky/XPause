import { useEffect, useState } from 'react';
import type {
  ExtensionRuntime,
  ExtensionStats,
  InsightSnapshot,
  Settings as XPauseSettings,
} from '../../../types';
import { defaultInsights, defaultStats, mergeStats } from '../../analytics';
import { defaultSettings } from '../../settings';
import {
  getStorage,
  hasExtensionStorage,
  setStorage,
  subscribeStorage,
} from '../../../shared/storage/storage';
import { sendTabSettingsUpdated, sendTabStartBreak } from '../../../shared/messaging/messages';
import { resolveTheme } from '../../../shared/utils/theme';

export const defaultRuntime: ExtensionRuntime = {
  fatigueScore: 0,
  urgency: 'none',
  reasons: ['Open any normal web page to start monitoring.'],
  updatedAt: Date.now(),
};

export const loadExtensionState = async () => {
  if (!hasExtensionStorage()) {
    return {
      settings: defaultSettings,
      stats: defaultStats,
      runtime: defaultRuntime,
      insights: defaultInsights,
    };
  }

  const result = await getStorage([
    'xpauseSettings',
    'xpauseStats',
    'xpauseRuntime',
    'xpauseInsights',
  ]);

  return {
    settings: {
      ...defaultSettings,
      ...(result.xpauseSettings as Partial<XPauseSettings> | undefined),
    },
    stats: mergeStats(result.xpauseStats as Partial<ExtensionStats> | undefined),
    runtime: {
      ...defaultRuntime,
      ...(result.xpauseRuntime as Partial<ExtensionRuntime> | undefined),
    },
    insights: {
      ...defaultInsights,
      ...(result.xpauseInsights as Partial<InsightSnapshot> | undefined),
    },
  };
};

export const useExtensionState = () => {
  const [settings, setSettings] = useState<XPauseSettings>(defaultSettings);
  const [stats, setStats] = useState<ExtensionStats>(defaultStats);
  const [runtime, setRuntime] = useState<ExtensionRuntime>(defaultRuntime);
  const [insights, setInsights] = useState<InsightSnapshot>(defaultInsights);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  const [systemNotice, setSystemNotice] = useState<string | null>(null);

  const resolvedTheme = resolveTheme(settings.themeMode, systemPrefersDark);

  useEffect(() => {
    void loadExtensionState().then(
      ({
        settings: nextSettings,
        stats: nextStats,
        runtime: nextRuntime,
        insights: nextInsights,
      }) => {
        setSettings(nextSettings);
        setStats(nextStats);
        setRuntime(nextRuntime);
        setInsights(nextInsights);
      },
    );

    const unsubscribe = subscribeStorage((changes) => {
      if (changes.xpauseSettings?.newValue) {
        setSettings({
          ...defaultSettings,
          ...(changes.xpauseSettings.newValue as Partial<XPauseSettings>),
        });
      }
      if (changes.xpauseStats?.newValue) {
        setStats(mergeStats(changes.xpauseStats.newValue as Partial<ExtensionStats>));
      }
      if (changes.xpauseRuntime?.newValue) {
        setRuntime({
          ...defaultRuntime,
          ...(changes.xpauseRuntime.newValue as Partial<ExtensionRuntime>),
        });
      }
      if (changes.xpauseInsights?.newValue) {
        setInsights({
          ...defaultInsights,
          ...(changes.xpauseInsights.newValue as Partial<InsightSnapshot>),
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () => setSystemPrefersDark(media.matches);
    updateSystemTheme();
    media.addEventListener('change', updateSystemTheme);
    return () => media.removeEventListener('change', updateSystemTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  const saveSettings = async (nextSettings: XPauseSettings) => {
    setSettings(nextSettings);
    if (!hasExtensionStorage()) return;

    try {
      await setStorage({ xpauseSettings: nextSettings });
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await sendTabSettingsUpdated(tab.id, nextSettings).catch(() => undefined);
      }
    } catch {
      // The extension context can disappear while popup is open
    }
  };

  const startBreak = async () => {
    if (!hasExtensionStorage()) return;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || typeof tab.id !== 'number') return;

      const isHttp = tab.url
        ? tab.url.startsWith('http://') || tab.url.startsWith('https://')
        : true;

      if (!isHttp) {
        setSystemNotice(
          'Micro-breaks cannot run on browser system pages. Please switch to a regular website.',
        );
        return;
      }

      setSystemNotice(null);

      try {
        await sendTabStartBreak(tab.id, settings);
      } catch {
        // Tab may not have content script injected yet (e.g. pre-existing tab).
        // Attempt dynamic injection and retry:
        if (chrome.scripting?.executeScript) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['assets/contentScript.js'],
            });
            await sendTabStartBreak(tab.id, settings);
            setSystemNotice(null);
            return;
          } catch {
            // Scripting injection failed
          }
        }

        setSystemNotice(
          'Cannot start break on this page. Please switch to a regular website tab.',
        );
      }
    } catch {
      // Ignore invalidated extension context
    }
  };

  return {
    settings,
    stats,
    runtime,
    insights,
    privacyOpen,
    resolvedTheme,
    systemNotice,
    dismissNotice: () => setSystemNotice(null),
    saveSettings,
    startBreak,
    openPrivacy: () => setPrivacyOpen(true),
    closePrivacy: () => setPrivacyOpen(false),
  };
};
