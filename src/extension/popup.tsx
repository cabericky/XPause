/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Activity,
  ArrowLeft,
  Brain,
  Clock3,
  FileText,
  Laptop,
  Moon,
  Eye,
  Sun,
  Music2,
  MousePointer2,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Settings,
  ShieldCheck,
  Trophy,
  Volume2,
  type LucideProps
} from 'lucide-react';
import { exercises } from '../data/exercises';
import logoUrl from '../assets/logo.png';
import type {
  BreakUrgency,
  DailyStats,
  ExerciseId,
  Settings as XPauseSettings,
  SoundTheme,
  ThemeMode
} from '../types';
import './popup.css';

type UsageCategory = 'work' | 'entertainment' | 'social';
type UsageRange = 'weekly' | 'monthly' | 'yearly';

interface ExtensionRuntime {
  fatigueScore: number;
  urgency: BreakUrgency;
  reasons: string[];
  updatedAt: number;
}

interface ExtensionStats {
  xp: number;
  completed: number;
  partial: number;
  skipped: number;
  daily: DailyStats;
  completedByExercise: Record<ExerciseId, number>;
  usage: UsageAnalytics;
}

interface UsageDay {
  date: string;
  screenMs: number;
  activeMs: number;
  passiveMs: number;
  categories: Record<UsageCategory, number>;
  socialVisits: number;
  scrollEvents: number;
  disconnectPrompts: number;
  eyeStrainPrompts: number;
}

interface UsageAnalytics {
  today: UsageDay;
  week: Record<string, UsageDay>;
}

interface InsightSnapshot {
  socialFatigueScore: number;
  eyeStrainMinutes: number;
  category: UsageCategory;
  passiveRatio: number;
  schedule: string[];
  disconnectSuggestion: string;
  updatedAt: number;
}

const defaultSettings: XPauseSettings = {
  sessionLengthMinutes: 25,
  sensitivity: 'medium',
  enabledExercises: ['blink', 'wrist', 'neck'],
  soundEnabled: true,
  notificationsEnabled: false,
  soundTheme: 'soft',
  themeMode: 'light',
  dailyBreakGoal: 4
};

interface WindowWithLegacyAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const soundThemes: Array<{ id: Exclude<SoundTheme, 'custom'>; label: string; description: string }> = [
  { id: 'soft', label: 'Soft', description: 'A calm single cue' },
  { id: 'chime', label: 'Chime', description: 'Two bright notes' },
  { id: 'pulse', label: 'Pulse', description: 'A firmer reminder' }
];

const themeModes: Array<{ id: ThemeMode; label: string; icon: React.ComponentType<LucideProps> }> = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Laptop }
];

const today = () => new Date().toISOString().slice(0, 10);

const emptyDaily = (): DailyStats => ({
  date: today(),
  xp: 0,
  completed: 0,
  partial: 0,
  skipped: 0,
  missed: 0,
  blink: 0,
  wrist: 0,
  neck: 0
});

const emptyUsageDay = (date = today()): UsageDay => ({
  date,
  screenMs: 0,
  activeMs: 0,
  passiveMs: 0,
  categories: { work: 0, entertainment: 0, social: 0 },
  socialVisits: 0,
  scrollEvents: 0,
  disconnectPrompts: 0,
  eyeStrainPrompts: 0
});

const defaultStats: ExtensionStats = {
  xp: 0,
  completed: 0,
  partial: 0,
  skipped: 0,
  daily: emptyDaily(),
  completedByExercise: { blink: 0, wrist: 0, neck: 0 },
  usage: {
    today: emptyUsageDay(),
    week: {}
  }
};

const defaultRuntime: ExtensionRuntime = {
  fatigueScore: 0,
  urgency: 'none',
  reasons: ['Open any normal web page to start monitoring.'],
  updatedAt: Date.now()
};

const defaultInsights: InsightSnapshot = {
  socialFatigueScore: 0,
  eyeStrainMinutes: 0,
  category: 'work',
  passiveRatio: 0,
  schedule: ['Open a normal web page to begin learning your rhythm.'],
  disconnectSuggestion: 'No disconnect needed yet.',
  updatedAt: Date.now()
};

const formatDuration = (ms: number) => {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
};

const formatChartDate = (date: string, range: UsageRange) => {
  if (!date) return '';
  const value = new Date(`${date}T00:00:00`);
  if (Number.isNaN(value.getTime())) return '';
  if (range === 'yearly') return value.toLocaleDateString(undefined, { month: 'short' });
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getSoundPattern = (theme: SoundTheme, variant: 'sound' | 'alert') => {
  const lift = variant === 'alert' ? 120 : 0;
  const patterns: Record<
    Exclude<SoundTheme, 'custom'>,
    Array<{ frequency: number; start: number; duration: number; gain: number }>
  > = {
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

const playUploadedSound = (dataUrl: string) => {
  const audio = new Audio(dataUrl);
  audio.volume = 0.78;
  audio.currentTime = 0;
  void audio.play().catch(() => undefined);
  window.setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, 2000);
};

const playSoundSample = (
  theme: SoundTheme,
  variant: 'sound' | 'alert' = 'sound',
  customSoundDataUrl?: string
) => {
  if (theme === 'custom' && customSoundDataUrl) {
    playUploadedSound(customSoundDataUrl);
    return;
  }
  const AudioContextClass = window.AudioContext || (window as WindowWithLegacyAudio).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  getSoundPattern(theme, variant).forEach((note) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = variant === 'alert' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(note.frequency, context.currentTime + note.start);
    gain.gain.setValueAtTime(0.0001, context.currentTime + note.start);
    gain.gain.exponentialRampToValueAtTime(note.gain, context.currentTime + note.start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + note.start + note.duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime + note.start);
    oscillator.stop(context.currentTime + note.start + note.duration + 0.04);
  });
  window.setTimeout(() => void context.close().catch(() => undefined), 1700);
};

const mergeStats = (value: Partial<ExtensionStats> | undefined): ExtensionStats => ({
  ...defaultStats,
  ...value,
  daily: { ...defaultStats.daily, ...value?.daily },
  completedByExercise: {
    ...defaultStats.completedByExercise,
    ...value?.completedByExercise
  },
  usage: {
    today: { ...defaultStats.usage.today, ...value?.usage?.today },
    week: value?.usage?.week ?? {}
  }
});

const hasExtensionStorage = () => {
  try {
    return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id && chrome.storage?.local);
  } catch {
    return false;
  }
};

const loadState = async () => {
  if (!hasExtensionStorage()) {
    return {
      settings: defaultSettings,
      stats: defaultStats,
      runtime: defaultRuntime,
      insights: defaultInsights
    };
  }
  let result: Record<string, unknown>;
  try {
    result = await chrome.storage.local.get([
      'xpauseSettings',
      'xpauseStats',
      'xpauseRuntime',
      'xpauseInsights'
    ]);
  } catch {
    result = {};
  }
  return {
    settings: { ...defaultSettings, ...(result.xpauseSettings as Partial<XPauseSettings> | undefined) },
    stats: mergeStats(result.xpauseStats as Partial<ExtensionStats> | undefined),
    runtime: { ...defaultRuntime, ...(result.xpauseRuntime as Partial<ExtensionRuntime> | undefined) },
    insights: {
      ...defaultInsights,
      ...(result.xpauseInsights as Partial<InsightSnapshot> | undefined)
    }
  };
};

const Popup = () => {
  const [settings, setSettings] = useState<XPauseSettings>(defaultSettings);
  const [stats, setStats] = useState<ExtensionStats>(defaultStats);
  const [runtime, setRuntime] = useState<ExtensionRuntime>(defaultRuntime);
  const [insights, setInsights] = useState<InsightSnapshot>(defaultInsights);
  const [soundPanelOpen, setSoundPanelOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [usageRange, setUsageRange] = useState<UsageRange>('weekly');
  const level = Math.floor(stats.xp / 500) + 1;
  const xpProgress = stats.xp % 500;
  const weeklyScreenMs =
    Object.values(stats.usage.week).reduce((total, day) => total + day.screenMs, 0) +
    stats.usage.today.screenMs;
  const usageDays = useMemo(
    () =>
      [...Object.values(stats.usage.week), stats.usage.today]
        .filter((day) => day.date)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [stats.usage.today, stats.usage.week]
  );
  const usageChart = useMemo(() => {
    const baseDays = [...usageDays];
    const buckets: Array<{ key: string; label: string; screenMs: number }> = [];
    if (usageRange === 'weekly') {
      const days = baseDays.slice(-7);
      while (days.length < 7) days.unshift(emptyUsageDay(''));
      return days.map((day, index) => ({
        key: day.date || `empty-week-${index}`,
        label: formatChartDate(day.date, usageRange),
        screenMs: day.screenMs
      }));
    }
    if (usageRange === 'monthly') {
      const days = baseDays.slice(-30);
      while (days.length < 30) days.unshift(emptyUsageDay(''));
      for (let index = 0; index < 6; index += 1) {
        const slice = days.slice(index * 5, index * 5 + 5);
        const firstDate = slice.find((day) => day.date)?.date ?? '';
        buckets.push({
          key: firstDate || `empty-month-${index}`,
          label: firstDate ? formatChartDate(firstDate, usageRange) : '',
          screenMs: slice.reduce((total, day) => total + day.screenMs, 0)
        });
      }
      return buckets;
    }
    const months = new Map<string, number>();
    baseDays.slice(-365).forEach((day) => {
      const key = day.date.slice(0, 7);
      months.set(key, (months.get(key) ?? 0) + day.screenMs);
    });
    const monthKeys = Array.from(months.keys()).sort().slice(-12);
    while (monthKeys.length < 12) monthKeys.unshift('');
    return monthKeys.map((key, index) => ({
      key: key || `empty-year-${index}`,
      label: key ? formatChartDate(`${key}-01`, usageRange) : '',
      screenMs: key ? (months.get(key) ?? 0) : 0
    }));
  }, [usageDays, usageRange]);
  const maxChartScreenMs = Math.max(1, ...usageChart.map((item) => item.screenMs));
  const resolvedTheme = settings.themeMode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : settings.themeMode;

  const badges = useMemo(
    () => [
      { label: 'Eye Guardian', unlocked: stats.completedByExercise.blink >= 20 },
      { label: 'Iron Wrists', unlocked: stats.completedByExercise.wrist >= 7 },
      { label: 'Calm Neck', unlocked: stats.completedByExercise.neck >= 10 },
      { label: 'XP Spark', unlocked: stats.xp >= 1000 }
    ],
    [stats]
  );

  useEffect(() => {
    void loadState().then(({ settings: nextSettings, stats: nextStats, runtime: nextRuntime, insights: nextInsights }) => {
      setSettings(nextSettings);
      setStats(nextStats);
      setRuntime(nextRuntime);
      setInsights(nextInsights);
    });

    const refreshId = window.setInterval(() => {
      void loadState().then(({ stats: nextStats, runtime: nextRuntime, insights: nextInsights }) => {
        setStats(nextStats);
        setRuntime(nextRuntime);
        setInsights(nextInsights);
      });
    }, 2500);

    return () => window.clearInterval(refreshId);
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
      await chrome.storage.local.set({ xpauseSettings: nextSettings });
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs
          .sendMessage(tab.id, { type: 'XP_PAUSE_SETTINGS_UPDATED', settings: nextSettings })
          .catch(() => undefined);
      }
    } catch {
      // The extension context can disappear while the popup is still open after reload.
    }
  };

  const previewAndSave = (nextSettings: XPauseSettings) => {
    playSoundSample(nextSettings.soundTheme, 'sound', nextSettings.customSoundDataUrl);
    void saveSettings(nextSettings);
  };

  const uploadCustomSound = (file: File) => {
    if (!file.type.startsWith('audio/')) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      const nextSettings = {
        ...settings,
        soundEnabled: true,
        soundTheme: 'custom' as const,
        customSoundDataUrl: dataUrl,
        customSoundName: file.name
      };
      playUploadedSound(dataUrl);
      void saveSettings(nextSettings);
    });
    reader.readAsDataURL(file);
  };

  const toggleExercise = (id: ExerciseId) => {
    const enabled = settings.enabledExercises.includes(id)
      ? settings.enabledExercises.filter((item) => item !== id)
      : [...settings.enabledExercises, id];
    void saveSettings({ ...settings, enabledExercises: enabled.length ? enabled : [id] });
  };

  const startBreak = async () => {
    if (!hasExtensionStorage()) return;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs
          .sendMessage(tab.id, { type: 'XP_PAUSE_START_BREAK', settings })
          .catch(() => undefined);
      }
    } catch {
      // Ignore invalidated extension contexts from an old popup.
    }
  };

  if (privacyOpen) {
    return (
      <main className="popup-shell privacy-shell">
        <header className="app-header">
          <button
            type="button"
            className="icon-button secondary-icon"
            onClick={() => setPrivacyOpen(false)}
            aria-label="Back"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="brand privacy-brand">
            <img src={logoUrl} alt="" aria-hidden="true" />
            <div>
              <strong>Privacy Policy</strong>
              <small>XPause - Micro-Break Recommender</small>
            </div>
          </div>
        </header>

        <section className="panel privacy-panel">
          <h2>
            <ShieldCheck size={16} />
            Local-first privacy
          </h2>
          <p>
            XPause helps users notice fatigue patterns and take guided micro-breaks. The extension
            stores settings, reminder progress, fatigue scores, XP, and local usage summaries in the
            browser using chrome.storage.local.
          </p>
          <p>
            XPause does not collect names, email addresses, payment information, authentication
            information, personal communications, precise location, or page contents. It does not send
            browsing activity, scores, settings, or uploaded custom sounds to a server.
          </p>
        </section>

        <section className="panel privacy-panel">
          <h2>
            <Activity size={16} />
            Data used
          </h2>
          <ul className="privacy-list">
            <li>Pointer movement, clicks, keyboard activity counts, scrolling, idle time, and tab visibility.</li>
            <li>Local screen-time summaries, active/passive time, social-site visits, and broad usage categories.</li>
            <li>Break completions, skipped reminders, XP, badges, exercise choices, sounds, and theme settings.</li>
          </ul>
        </section>

        <section className="panel privacy-panel">
          <h2>
            <FileText size={16} />
            Data sharing
          </h2>
          <p>
            XPause does not sell, rent, transfer, or share user data with third parties. User data is
            used only to provide the extension's single purpose: local fatigue-aware micro-break
            reminders and related progress tracking.
          </p>
          <p>
            Users can remove locally stored XPause data at any time by uninstalling the extension or
            clearing the extension's site and storage data from the browser.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="popup-shell">
      <header className="app-header">
        <div className="brand">
          <img src={logoUrl} alt="" aria-hidden="true" />
          <div>
            <strong>XPause</strong>
            <small>Local fatigue assistant</small>
          </div>
        </div>
        <button type="button" className="icon-button start-button" onClick={startBreak} aria-label="Start break">
          <Play size={16} fill="currentColor" />
        </button>
      </header>

      <section className="status-strip" aria-label="Current monitoring status">
        <span>
          <ShieldCheck size={14} />
          On-device
        </span>
        <span>
          <Activity size={14} />
          {runtime.urgency === 'none' ? 'Steady' : runtime.urgency}
        </span>
        <span>
          <MousePointer2 size={14} />
          {insights.category}
        </span>
      </section>

      <div className="score-grid">
        <section className={`score-card ${runtime.urgency}`}>
          <div className="card-title">
            <p>Fatigue</p>
            <Activity size={16} />
          </div>
          <strong>{runtime.fatigueScore}</strong>
          <div className="meter" aria-hidden="true">
            <span style={{ width: `${runtime.fatigueScore}%` }} />
          </div>
          <small>{runtime.reasons[0] ?? 'Activity is balanced.'}</small>
        </section>

        <section className={`score-card social ${insights.socialFatigueScore >= 70 ? 'critical' : ''}`}>
          <div className="card-title">
            <p>Social</p>
            <Brain size={16} />
          </div>
          <strong>{insights.socialFatigueScore}</strong>
          <div className="meter" aria-hidden="true">
            <span style={{ width: `${insights.socialFatigueScore}%` }} />
          </div>
          <small>{insights.disconnectSuggestion}</small>
        </section>
      </div>

      <section className="stat-grid" aria-label="Rewards">
        <div>
          <Trophy size={16} />
          <strong>{stats.xp}</strong>
          <span>XP</span>
        </div>
        <div>
          <RotateCcw size={16} />
          <strong>{stats.daily.completed + stats.daily.partial}</strong>
          <span>Today</span>
        </div>
        <div>
          <Eye size={16} />
          <strong>{level}</strong>
          <span>Level</span>
        </div>
      </section>

      <section className="panel analytics-panel">
        <div className="panel-title-row">
          <h2>
            <Clock3 size={16} />
            Screen usage
          </h2>
          <div className="segments range-segments">
            {(['weekly', 'monthly', 'yearly'] as UsageRange[]).map((range) => (
              <button
                type="button"
                className={usageRange === range ? 'active' : ''}
                onClick={() => setUsageRange(range)}
                key={range}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="usage-chart column-chart" aria-label={`${usageRange} screen usage column chart`}>
          {usageChart.map((item) => (
            <div className="usage-chart-item" key={item.key}>
              <div className="usage-chart-track">
                <span
                  style={{ height: `${Math.max(6, (item.screenMs / maxChartScreenMs) * 92)}px` }}
                  title={item.label ? `${item.label}: ${formatDuration(item.screenMs)}` : 'No data'}
                />
              </div>
              <small>{item.label || '-'}</small>
            </div>
          ))}
        </div>
        <div className="usage-grid">
          <div>
            <strong>{formatDuration(stats.usage.today.screenMs)}</strong>
            <span>Today screen</span>
          </div>
          <div>
            <strong>{formatDuration(weeklyScreenMs)}</strong>
            <span>Week screen</span>
          </div>
          <div>
            <strong>{formatDuration(stats.usage.today.activeMs)}</strong>
            <span>Active</span>
          </div>
          <div>
            <strong>{formatDuration(stats.usage.today.passiveMs)}</strong>
            <span>Passive</span>
          </div>
        </div>
        <div className="category-bars" aria-label="Usage by category">
          {(['work', 'entertainment', 'social'] as UsageCategory[]).map((category) => {
            const total = Math.max(1, stats.usage.today.screenMs);
            return (
              <div key={category}>
                <span>{category}</span>
                <div className="meter small">
                  <span style={{ width: `${(stats.usage.today.categories[category] / total) * 100}%` }} />
                </div>
                <small>{formatDuration(stats.usage.today.categories[category])}</small>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2>
          <Brain size={16} />
          AI schedule
        </h2>
        <div className="usage-grid">
          <div>
            <strong>{insights.eyeStrainMinutes}m</strong>
            <span>Eye timer</span>
          </div>
          <div>
            <strong>{Math.round(insights.passiveRatio * 100)}%</strong>
            <span>Passive ratio</span>
          </div>
        </div>
        <ul className="insight-list">
          {insights.schedule.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <div className="meter small" aria-label={`${xpProgress} XP toward next level`}>
        <span style={{ width: `${(xpProgress / 500) * 100}%` }} />
      </div>

      <section className="panel">
        <h2>
          <Settings size={16} />
          Settings
        </h2>
        <div className="settings-section">
          <h3>Sensitivity</h3>
          <label>
            First break
            <input
              type="number"
              min={5}
              max={90}
              value={settings.sessionLengthMinutes}
              onChange={(event) =>
                void saveSettings({ ...settings, sessionLengthMinutes: Number(event.target.value) })
              }
            />
          </label>
          <div className="segments">
            {(['low', 'medium', 'high'] as const).map((levelName) => (
              <button
                type="button"
                className={settings.sensitivity === levelName ? 'active' : ''}
                onClick={() => void saveSettings({ ...settings, sensitivity: levelName })}
                key={levelName}
              >
                {levelName}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-section">
          <h3>Exercises</h3>
          <div className="checks">
            {exercises.map((exercise) => (
              <label key={exercise.id}>
                <input
                  type="checkbox"
                  checked={settings.enabledExercises.includes(exercise.id)}
                  onChange={() => toggleExercise(exercise.id)}
                />
                {exercise.shortLabel}
              </label>
            ))}
          </div>
        </div>
        <div className="settings-section">
          <h3>Sounds</h3>
          <div className="segments">
            <button
              type="button"
              className={settings.soundEnabled ? 'active' : ''}
              onClick={() => previewAndSave({ ...settings, soundEnabled: !settings.soundEnabled })}
            >
              <Volume2 size={14} />
              Sound
            </button>
            <button type="button" onClick={() => setSoundPanelOpen((open) => !open)}>
              <SlidersHorizontal size={14} />
              Customize
            </button>
          </div>
        </div>
        {soundPanelOpen ? (
          <div className="sound-panel">
            <div className="sound-panel-title">
              <span>
                <Music2 size={15} />
                Exercise popup sound
              </span>
              <button
                type="button"
                onClick={() => playSoundSample(settings.soundTheme, 'sound', settings.customSoundDataUrl)}
              >
                Test
              </button>
            </div>
            <div className="sound-options">
              {soundThemes.map((theme) => (
                <button
                  type="button"
                  className={settings.soundTheme === theme.id ? 'active' : ''}
                  onClick={() => {
                    playSoundSample(theme.id, 'sound');
                    void saveSettings({ ...settings, soundTheme: theme.id, soundEnabled: true });
                  }}
                  key={theme.id}
                >
                  <strong>{theme.label}</strong>
                  <span>{theme.description}</span>
                </button>
              ))}
            </div>
            <label className="upload-sound">
              <span>{settings.customSoundName ?? 'Upload custom audio'}</span>
              <input
                type="file"
                accept="audio/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadCustomSound(file);
                }}
              />
            </label>
            {settings.customSoundDataUrl ? (
              <button
                type="button"
                className={settings.soundTheme === 'custom' ? 'custom-sound active' : 'custom-sound'}
                onClick={() => {
                  playUploadedSound(settings.customSoundDataUrl!);
                  void saveSettings({ ...settings, soundTheme: 'custom', soundEnabled: true });
                }}
              >
                Use uploaded sound
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="settings-section">
          <h3>Appearance</h3>
          <div className="segments theme-segments">
            {themeModes.map((theme) => {
              const Icon = theme.icon;
              return (
                <button
                  type="button"
                  className={settings.themeMode === theme.id ? 'active' : ''}
                  onClick={() => void saveSettings({ ...settings, themeMode: theme.id })}
                  key={theme.id}
                >
                  <Icon size={14} />
                  {theme.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="settings-section">
          <h3>Privacy</h3>
          <button type="button" className="privacy-link-button" onClick={() => setPrivacyOpen(true)}>
            <FileText size={15} />
            View privacy policy
          </button>
        </div>
      </section>

      <section className="badges">
        {badges.map((badge) => (
          <span className={badge.unlocked ? 'unlocked' : ''} key={badge.label}>
            {badge.label}
          </span>
        ))}
      </section>
    </main>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
