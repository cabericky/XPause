type Sensitivity = 'low' | 'medium' | 'high';
type BreakUrgency = 'none' | 'soft' | 'urgent' | 'critical';
type ExerciseId = 'blink' | 'wrist' | 'neck';
type UsageCategory = 'work' | 'entertainment' | 'social';
type SoundTheme = 'soft' | 'chime' | 'pulse' | 'custom';
type ThemeMode = 'light' | 'dark' | 'system';
type ReminderKind = 'fatigue' | 'social';

interface WindowWithLegacyAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

interface ActivitySignals {
  mouseVelocity: number;
  idleMs: number;
  keypressesPerMinute: number;
  typingBurstCount: number;
  scrollVelocity: number;
  scrollDepth: number;
  visibilityChanges: number;
  continuousUseMinutes: number;
}

interface ExerciseStep {
  label: string;
  duration: number;
  cue: string;
}

interface ExerciseDefinition {
  id: ExerciseId;
  title: string;
  shortLabel: string;
  duration: number;
  steps: ExerciseStep[];
}

interface ExtensionSettings {
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

interface ExtensionStats {
  xp: number;
  completed: number;
  partial: number;
  skipped: number;
  daily: {
    date: string;
    xp: number;
    completed: number;
    partial: number;
    skipped: number;
    missed: number;
    blink: number;
    wrist: number;
    neck: number;
  };
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

const defaultSettings: ExtensionSettings = {
  sessionLengthMinutes: 25,
  sensitivity: 'medium',
  enabledExercises: ['blink', 'wrist', 'neck'],
  soundEnabled: true,
  notificationsEnabled: false,
  soundTheme: 'soft',
  themeMode: 'light',
  dailyBreakGoal: 4
};

const exercises: ExerciseDefinition[] = [
  {
    id: 'blink',
    title: 'Blink Exercise',
    shortLabel: 'Eyes',
    duration: 60,
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
    steps: [
      { label: 'Turn left and hold', duration: 30, cue: 'Keep shoulders low and jaw relaxed.' },
      { label: 'Turn right and hold', duration: 30, cue: 'Move slowly through the center.' },
      { label: 'Forward release', duration: 30, cue: 'Drop chin gently and breathe.' }
    ]
  }
];

const today = () => new Date().toISOString().slice(0, 10);

const emptyDaily = () => ({
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

const socialHosts = [
  'facebook.com',
  'instagram.com',
  'x.com',
  'twitter.com',
  'tiktok.com',
  'reddit.com',
  'linkedin.com',
  'threads.net',
  'snapchat.com',
  'pinterest.com'
];

const entertainmentHosts = [
  'youtube.com',
  'netflix.com',
  'twitch.tv',
  'spotify.com',
  'hulu.com',
  'disneyplus.com',
  'primevideo.com',
  'soundcloud.com'
];

const workHosts = [
  'github.com',
  'gitlab.com',
  'notion.so',
  'slack.com',
  'docs.google.com',
  'drive.google.com',
  'office.com',
  'figma.com',
  'linear.app',
  'jira.com',
  'atlassian.net'
];

const thresholds: Record<Sensitivity, { soft: number; urgent: number; critical: number }> = {
  low: { soft: 70, urgent: 90, critical: 96 },
  medium: { soft: 60, urgent: 85, critical: 94 },
  high: { soft: 48, urgent: 76, critical: 90 }
};

const emptySignals = (): ActivitySignals => ({
  mouseVelocity: 0,
  idleMs: 0,
  keypressesPerMinute: 0,
  typingBurstCount: 0,
  scrollVelocity: 0,
  scrollDepth: 0,
  visibilityChanges: 0,
  continuousUseMinutes: 0
});

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const getUrgency = (score: number, sensitivity: Sensitivity): BreakUrgency => {
  const level = thresholds[sensitivity];
  if (score >= level.critical) return 'critical';
  if (score >= level.urgent) return 'urgent';
  if (score >= level.soft) return 'soft';
  return 'none';
};

const scoreActivity = (
  signals: ActivitySignals,
  previousScore: number,
  sensitivity: Sensitivity
) => {
  const reasons: string[] = [];
  const sessionPressure = Math.min(signals.continuousUseMinutes * 1.55, 42);
  const typingPressure = Math.min(signals.keypressesPerMinute / 2.5 + signals.typingBurstCount * 1.8, 20);
  const mousePressure = Math.min(signals.mouseVelocity / 46, 14);
  const scrollPressure = Math.min(signals.scrollVelocity / 30 + signals.scrollDepth / 11, 16);
  const visibilityPressure = Math.min(signals.visibilityChanges * 1.8, 8);
  const exertion = sessionPressure + typingPressure + mousePressure + scrollPressure + visibilityPressure;
  const idleRecovery = signals.idleMs > 45_000 ? Math.min(signals.idleMs / 20_000, 16) : 0;
  const score = clamp(previousScore * 0.72 + exertion * 0.28 - idleRecovery);

  if (signals.continuousUseMinutes >= 25) reasons.push('Long continuous focus session');
  if (signals.keypressesPerMinute > 70) reasons.push('Sustained typing intensity');
  if (signals.mouseVelocity > 420) reasons.push('High pointer movement');
  if (signals.scrollVelocity > 260) reasons.push('Rapid scrolling pattern');
  if (signals.visibilityChanges >= 4) reasons.push('Frequent context switching');
  if (idleRecovery > 4) reasons.push('Idle recovery detected');

  return { score: Math.round(score), urgency: getUrgency(score, sensitivity), reasons };
};

const hasExtensionContext = () => {
  try {
    return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id && chrome.storage?.local);
  } catch {
    return false;
  }
};

const readStorage = async <T,>(key: string, fallback: T): Promise<T> => {
  if (!hasExtensionContext()) return fallback;
  try {
    const result = await chrome.storage.local.get(key);
    return { ...fallback, ...(result[key] as Partial<T> | undefined) };
  } catch {
    return fallback;
  }
};

const getStorage = async (key: string) => {
  if (!hasExtensionContext()) return {};
  try {
    return await chrome.storage.local.get(key);
  } catch {
    return {};
  }
};

const setStorage = async (items: Record<string, unknown>) => {
  if (!hasExtensionContext()) return;
  try {
    await chrome.storage.local.set(items);
  } catch {
    // The extension may have been reloaded while this content script is still injected.
  }
};

const sendRuntimeMessage = (message: unknown) => {
  if (!hasExtensionContext()) return;
  try {
    void chrome.runtime.sendMessage(message).catch(() => undefined);
  } catch {
    // Ignore invalidated extension contexts from stale content scripts.
  }
};

const classifyHost = (host: string): UsageCategory => {
  const normalized = host.replace(/^www\./, '');
  if (socialHosts.some((item) => normalized === item || normalized.endsWith(`.${item}`))) return 'social';
  if (entertainmentHosts.some((item) => normalized === item || normalized.endsWith(`.${item}`))) {
    return 'entertainment';
  }
  if (workHosts.some((item) => normalized === item || normalized.endsWith(`.${item}`))) return 'work';
  return 'work';
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

const saveRuntime = async (score: number, urgency: BreakUrgency, reasons: string[]) => {
  await setStorage({
    xpauseRuntime: {
      fatigueScore: score,
      urgency,
      reasons: reasons.length ? reasons : ['Activity is currently balanced'],
      updatedAt: Date.now()
    }
  });
};

const rollStats = (stats: ExtensionStats): ExtensionStats => {
  const todayDate = today();
  const currentUsage = stats.usage?.today ?? emptyUsageDay(todayDate);
  const week = { ...(stats.usage?.week ?? {}) };
  if (currentUsage.date !== todayDate) {
    week[currentUsage.date] = currentUsage;
  }
  const recentWeek = Object.fromEntries(
    Object.entries(week)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
  ) as Record<string, UsageDay>;

  return {
    ...stats,
    daily: stats.daily.date === todayDate ? stats.daily : emptyDaily(),
    usage: {
      today: currentUsage.date === todayDate ? currentUsage : emptyUsageDay(todayDate),
      week: recentWeek
    }
  };
};

const buildInsights = (
  usage: UsageDay,
  category: UsageCategory,
  eyeStrainMinutes: number,
  socialFatigueScore: number
): InsightSnapshot => {
  const passiveRatio = usage.screenMs > 0 ? usage.passiveMs / usage.screenMs : 0;
  const socialMinutes = Math.round(usage.categories.social / 60_000);
  const entertainmentMinutes = Math.round(usage.categories.entertainment / 60_000);
  const schedule = [
    eyeStrainMinutes >= 20
      ? 'Run a 20-20-20 eye reset now.'
      : `Next eye reset in ${Math.max(1, 20 - eyeStrainMinutes)} min.`,
    passiveRatio > 0.62
      ? 'Use shorter 8-12 minute browsing blocks with a hard stop.'
      : 'Keep the next focus block around 25 minutes.',
    socialMinutes > 30 || socialFatigueScore >= 65
      ? 'Take a 15 minute social disconnect before returning.'
      : entertainmentMinutes > 45
        ? 'Switch to a work or recovery tab before more entertainment.'
        : 'Micro-break timing looks balanced.'
  ];

  return {
    socialFatigueScore,
    eyeStrainMinutes,
    category,
    passiveRatio,
    schedule,
    disconnectSuggestion:
      socialFatigueScore >= 75
        ? 'Disconnect strongly recommended.'
        : socialFatigueScore >= 55
          ? 'Consider closing social tabs for one focus block.'
          : 'No disconnect needed yet.',
    updatedAt: Date.now()
  };
};

const getEnabledExercise = (settings: ExtensionSettings) => {
  const enabled = settings.enabledExercises.length ? settings.enabledExercises : defaultSettings.enabledExercises;
  const chosen = enabled[Math.floor(Math.random() * enabled.length)];
  return exercises.find((exercise) => exercise.id === chosen) ?? exercises[0];
};

const getSoundPattern = (theme: SoundTheme) => {
  const patterns: Record<
    Exclude<SoundTheme, 'custom'>,
    Array<{ frequency: number; start: number; duration: number; gain: number }>
  > = {
    soft: [
      { frequency: 520, start: 0, duration: 0.34, gain: 0.026 },
      { frequency: 660, start: 0.42, duration: 0.42, gain: 0.02 }
    ],
    chime: [
      { frequency: 620, start: 0, duration: 0.24, gain: 0.024 },
      { frequency: 820, start: 0.28, duration: 0.28, gain: 0.022 },
      { frequency: 980, start: 0.62, duration: 0.38, gain: 0.018 }
    ],
    pulse: [
      { frequency: 420, start: 0, duration: 0.18, gain: 0.028 },
      { frequency: 420, start: 0.28, duration: 0.18, gain: 0.026 },
      { frequency: 560, start: 0.58, duration: 0.28, gain: 0.022 }
    ]
  };
  return theme === 'custom' ? patterns.soft : patterns[theme];
};

const resolveTheme = (themeMode: ThemeMode) => {
  if (themeMode !== 'system') return themeMode;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const createStyles = () => `
  :host { all: initial; color-scheme: light dark; }
  .xp-panel {
    position: fixed;
    right: 18px;
    bottom: 18px;
    z-index: 2147483647;
    width: min(390px, calc(100vw - 28px));
    box-sizing: border-box;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #FFFFFF;
    color: #172033;
    box-shadow: 0 22px 70px rgba(15, 23, 42, .18);
    font-family: Inter, system-ui, sans-serif;
    padding: 16px;
  }
  .xp-panel.xp-theme-dark {
    border-color: rgba(148, 163, 184, .16);
    background: #111827;
    color: #E5EDF6;
    box-shadow: 0 22px 70px rgba(0, 0, 0, .38);
  }
  .xp-panel.critical { border-color: rgba(225, 29, 72, .72); box-shadow: 0 0 0 9999px rgba(15, 23, 42, .18), 0 22px 70px rgba(15, 23, 42, .18); }
  .xp-panel.xp-theme-dark.critical { box-shadow: 0 0 0 9999px rgba(13, 27, 42, .42), 0 22px 70px rgba(0, 0, 0, .38); }
  .xp-top, .xp-actions, .xp-dots { display: flex; align-items: center; }
  .xp-top { justify-content: space-between; gap: 12px; }
  .xp-eyebrow { margin: 0 0 4px; color: #0284C7; font: 700 11px/1 Inter, sans-serif; text-transform: uppercase; }
  h2, h3, p { margin: 0; }
  h2 { font: 700 22px/1.15 Space Grotesk, Inter, sans-serif; }
  h3 { font: 700 18px/1.25 Space Grotesk, Inter, sans-serif; text-align: center; }
  p { color: #475569; font: 500 14px/1.5 Inter, sans-serif; }
  .xp-theme-dark p { color: #CBD5E1; }
  .xp-theme-dark .xp-eyebrow { color: #38BDF8; }
  button { min-height: 40px; border: 0; border-radius: 8px; font: 700 13px/1 Inter, sans-serif; cursor: pointer; }
  .xp-close { width: 38px; background: #F1F5F9; color: #172033; }
  .xp-theme-dark .xp-close { background: rgba(255,255,255,.08); color: #E5EDF6; }
  .xp-visual { display: grid; place-items: center; height: 116px; margin: 16px 0; border: 1px solid #E2E8F0; border-radius: 9px; background: #F8FAFC; overflow: hidden; }
  .xp-theme-dark .xp-visual { border-color: rgba(148, 163, 184, .14); background: rgba(15, 23, 42, .72); }
  .xp-shape { display: block; width: 74px; height: 74px; }
  .blink .xp-shape { height: 42px; border: 4px solid #16A34A; border-radius: 50%; animation: xpBlink 3s ease-in-out infinite; }
  .wrist .xp-shape { border: 5px solid #0284C7; border-left-color: transparent; border-radius: 50%; animation: xpRotate 2.6s linear infinite; }
  .neck .xp-shape { width: 54px; height: 68px; border-radius: 45% 45% 40% 40%; background: #D97706; animation: xpNeck 3s ease-in-out infinite; }
  .xp-ring { display: grid; place-items: center; width: 112px; height: 112px; margin: 0 auto 14px; border-radius: 50%; background: radial-gradient(circle closest-side, #FFFFFF 72%, transparent 73%), conic-gradient(#16A34A var(--progress), #E2E8F0 0); }
  .xp-theme-dark .xp-ring { background: radial-gradient(circle closest-side, #111827 72%, transparent 73%), conic-gradient(#22C55E var(--progress), rgba(240,237,230,.12) 0); }
  .xp-ring strong { align-self: end; font: 700 36px/1 Space Grotesk, Inter, sans-serif; }
  .xp-ring span { align-self: start; color: #64748B; font: 600 12px/1 Inter, sans-serif; }
  .xp-theme-dark .xp-ring span { color: #94A3B8; }
  .xp-copy { display: grid; gap: 7px; margin: 0 0 12px; text-align: center; }
  .xp-dots { justify-content: center; gap: 7px; margin: 0 0 14px; }
  .xp-dots span { width: 32px; height: 6px; border-radius: 999px; background: #E2E8F0; }
  .xp-theme-dark .xp-dots span { background: rgba(240,237,230,.14); }
  .xp-dots span.active { background: #16A34A; }
  .xp-actions { justify-content: flex-end; flex-wrap: wrap; gap: 8px; }
  .xp-secondary { padding: 0 12px; border: 1px solid #CBD5E1; background: #FFFFFF; color: #172033; }
  .xp-theme-dark .xp-secondary { border-color: rgba(157,180,192,.28); background: rgba(255,255,255,.07); color: #E5EDF6; }
  .xp-primary { padding: 0 14px; background: #0284C7; color: #FFFFFF; }
  .xp-reminder-mark {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 10px;
    background: #E7F6FE;
    color: #0369A1;
    font: 800 18px/1 Inter, sans-serif;
  }
  .xp-theme-dark .xp-reminder-mark { background: rgba(56, 189, 248, .14); color: #38BDF8; }
  .xp-reminder-body {
    display: grid;
    gap: 10px;
    margin: 16px 0;
    border: 1px solid #E2E8F0;
    border-radius: 9px;
    background: #F8FAFC;
    padding: 12px;
  }
  .xp-theme-dark .xp-reminder-body { border-color: rgba(148, 163, 184, .14); background: rgba(15, 23, 42, .72); }
  .xp-reminder-stat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: #475569;
    font: 700 13px/1 Inter, sans-serif;
  }
  .xp-theme-dark .xp-reminder-stat { color: #CBD5E1; }
  .xp-reminder-stat strong { color: #172033; font-size: 22px; }
  .xp-theme-dark .xp-reminder-stat strong { color: #E5EDF6; }
  @keyframes xpBlink { 0%, 65%, 100% { transform: scaleY(1); } 72% { transform: scaleY(.08); } }
  @keyframes xpRotate { to { transform: rotate(360deg); } }
  @keyframes xpNeck { 0%,100% { transform: translateX(-12px) rotate(-6deg); } 50% { transform: translateX(12px) rotate(6deg); } }
  @media (prefers-reduced-motion: reduce) { * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
`;

const install = () => {
  if (window.top !== window || document.getElementById('xpause-extension-root')) return;

  const host = document.createElement('div');
  host.id = 'xpause-extension-root';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = createStyles();
  const mount = document.createElement('div');
  shadow.append(style, mount);
  document.documentElement.append(host);

  let fatigueScore = 0;
  let socialFatigueScore = 0;
  let snoozedUntil = 0;
  let activeReminder: ReminderKind | null = null;
  let activeExercise: ExerciseDefinition | null = null;
  let activeUrgency: BreakUrgency = 'soft';
  let exerciseElapsed = 0;
  let exerciseTimer: number | null = null;
  const signals = emptySignals();
  const lastPointer = { x: 0, y: 0, time: Date.now() };
  const lastScroll = { y: window.scrollY, time: Date.now() };
  let lastActivity = Date.now();
  let sessionStart = Date.now();
  let burstStarted = false;
  let currentSettings = defaultSettings;
  let keyTimestamps: number[] = [];
  let lastInteractionAt = Date.now();
  let lastTickAt = Date.now();
  let eyeStrainStartedAt = Date.now();
  let lastEyePromptAt = 0;
  let lastDisconnectPromptAt = 0;
  let lastFatiguePromptAt = 0;
  const category = classifyHost(location.hostname);

  const markActive = () => {
    const now = Date.now();
    if (now - lastActivity > 5 * 60_000) sessionStart = now;
    lastActivity = now;
    lastInteractionAt = now;
  };

  const playCustomSound = async (dataUrl: string) => {
    const audio = new Audio(dataUrl);
    audio.volume = 0.78;
    audio.currentTime = 0;
    await audio.play().catch(() => undefined);
    window.setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 2000);
  };

  const beep = async () => {
    if (!currentSettings.soundEnabled) return;
    if (currentSettings.soundTheme === 'custom' && currentSettings.customSoundDataUrl) {
      await playCustomSound(currentSettings.customSoundDataUrl).catch(() => undefined);
      return;
    }
    const AudioContextClass = window.AudioContext || (window as WindowWithLegacyAudio).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    getSoundPattern(currentSettings.soundTheme).forEach((note) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = currentSettings.soundTheme === 'pulse' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(note.frequency, context.currentTime + note.start);
      gain.gain.setValueAtTime(0.0001, context.currentTime + note.start);
      gain.gain.exponentialRampToValueAtTime(note.gain, context.currentTime + note.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + note.start + note.duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + note.start);
      oscillator.stop(context.currentTime + note.start + note.duration + 0.04);
    });
    window.setTimeout(() => void context.close().catch(() => undefined), 1500);
  };

  const currentStepIndex = () => {
    if (!activeExercise) return 0;
    let cursor = 0;
    for (let index = 0; index < activeExercise.steps.length; index += 1) {
      cursor += activeExercise.steps[index].duration;
      if (exerciseElapsed < cursor) return index;
    }
    return activeExercise.steps.length - 1;
  };

  const saveCompletion = async (exercise: ExerciseDefinition, partial: boolean) => {
    const stored = rollStats(await readStorage('xpauseStats', defaultStats));
    const xpAward = partial ? 50 : 100;
    const nextStats: ExtensionStats = {
      ...stored,
      xp: stored.xp + xpAward,
      completed: stored.completed + (partial ? 0 : 1),
      partial: stored.partial + (partial ? 1 : 0),
      daily: {
        ...stored.daily,
        xp: stored.daily.xp + xpAward,
        completed: stored.daily.completed + (partial ? 0 : 1),
        partial: stored.daily.partial + (partial ? 1 : 0),
        [exercise.id]: stored.daily[exercise.id] + 1
      },
      completedByExercise: {
        ...stored.completedByExercise,
        [exercise.id]: stored.completedByExercise[exercise.id] + 1
      }
    };
    fatigueScore = Math.max(0, fatigueScore - (partial ? 28 : 55));
    await setStorage({ xpauseStats: nextStats });
    await saveRuntime(fatigueScore, 'none', ['Break completed']);
  };

  const saveMiss = async (kind: 'skipped' | 'snoozed') => {
    const stored = rollStats(await readStorage('xpauseStats', defaultStats));
    const nextStats: ExtensionStats = {
      ...stored,
      skipped: stored.skipped + (kind === 'skipped' ? 1 : 0),
      daily: {
        ...stored.daily,
        skipped: stored.daily.skipped + (kind === 'skipped' ? 1 : 0),
        missed: stored.daily.missed + 1
      }
    };
    await setStorage({ xpauseStats: nextStats });
  };

  const closePanel = () => {
    if (exerciseTimer) window.clearInterval(exerciseTimer);
    exerciseTimer = null;
    activeExercise = null;
    activeUrgency = 'soft';
    exerciseElapsed = 0;
    mount.innerHTML = '';
  };

  const closeReminder = () => {
    activeReminder = null;
    mount.innerHTML = '';
  };

  const renderReminder = (kind: ReminderKind, urgency: BreakUrgency = 'soft', playSound = true) => {
    if (activeExercise) return;
    activeReminder = kind;
    activeUrgency = urgency;
    if (playSound) void beep();
    const themeClass = `xp-theme-${resolveTheme(currentSettings.themeMode)}`;
    const isSocial = kind === 'social';
    const score = isSocial ? socialFatigueScore : fatigueScore;
    mount.innerHTML = `
      <aside class="xp-panel ${themeClass} ${urgency}" role="dialog" aria-modal="${urgency === 'critical'}" aria-labelledby="xpause-reminder-title">
        <div class="xp-top">
          <div>
            <p class="xp-eyebrow">${isSocial ? 'Social disconnect' : 'Fatigue reminder'}</p>
            <h2 id="xpause-reminder-title">${isSocial ? 'Step away from social feeds' : 'Your focus load is high'}</h2>
          </div>
          <span class="xp-reminder-mark" aria-hidden="true">${isSocial ? 'S' : 'F'}</span>
        </div>
        <div class="xp-reminder-body">
          <p>${isSocial ? 'Your social fatigue score is elevated. A short disconnect can make the next focus block feel lighter.' : 'Your fatigue score is elevated. Take a guided reset before continuing.'}</p>
          <div class="xp-reminder-stat"><span>${isSocial ? 'Social score' : 'Fatigue score'}</span><strong>${score}</strong></div>
        </div>
        <div class="xp-actions">
          <button class="xp-secondary" type="button" data-action="reminder-snooze">Snooze</button>
          <button class="xp-secondary" type="button" data-action="reminder-dismiss">Dismiss</button>
          <button class="xp-primary" type="button" data-action="${isSocial ? 'disconnect' : 'start-reset'}">${isSocial ? 'Disconnect 15m' : 'Start reset'}</button>
        </div>
      </aside>
    `;
  };

  const renderPanel = (urgency: BreakUrgency) => {
    if (!activeExercise) return;
    const stepIndex = currentStepIndex();
    const step = activeExercise.steps[stepIndex];
    const remaining = Math.max(0, activeExercise.duration - exerciseElapsed);
    const progress = Math.min(100, (exerciseElapsed / activeExercise.duration) * 100);
    const themeClass = `xp-theme-${resolveTheme(currentSettings.themeMode)}`;
    mount.innerHTML = `
      <aside class="xp-panel ${themeClass} ${urgency}" role="dialog" aria-modal="${urgency === 'critical'}" aria-labelledby="xpause-title">
        <div class="xp-top">
          <div>
            <p class="xp-eyebrow">${urgency === 'critical' ? 'Critical reset' : 'XPause micro-break'}</p>
            <h2 id="xpause-title">${activeExercise.title}</h2>
          </div>
          <button class="xp-close" type="button" data-action="close" aria-label="Dismiss">X</button>
        </div>
        <div class="xp-visual ${activeExercise.id}" aria-hidden="true"><span class="xp-shape"></span></div>
        <div class="xp-ring" style="--progress: ${progress}%"><strong>${remaining}</strong><span>sec</span></div>
        <div class="xp-copy"><h3>${step.label}</h3><p>${step.cue}</p></div>
        <div class="xp-dots" aria-label="Step ${stepIndex + 1} of ${activeExercise.steps.length}">
          ${activeExercise.steps.map((item, index) => `<span class="${index <= stepIndex ? 'active' : ''}" title="${item.label}"></span>`).join('')}
        </div>
        <div class="xp-actions">
          <button class="xp-secondary" type="button" data-action="snooze">Snooze</button>
          <button class="xp-secondary" type="button" data-action="skip">Skip</button>
          <button class="xp-primary" type="button" data-action="done">Done</button>
        </div>
      </aside>
    `;
  };

  const startBreak = async (
    urgency: BreakUrgency = 'soft',
    exerciseOverride?: ExerciseDefinition,
    settingsOverride?: ExtensionSettings
  ) => {
    if (activeExercise) return;
    currentSettings = settingsOverride ?? (await readStorage('xpauseSettings', defaultSettings));
    activeExercise = exerciseOverride ?? getEnabledExercise(currentSettings);
    activeUrgency = urgency;
    exerciseElapsed = 0;
    void beep();
    renderPanel(urgency);
    if (currentSettings.notificationsEnabled) {
      sendRuntimeMessage({
        type: 'XP_PAUSE_NOTIFY',
        body: `${activeExercise.title} is ready. Your fatigue score is ${fatigueScore}.`
      });
    }
    exerciseTimer = window.setInterval(() => {
      if (!activeExercise) return;
      const previousStep = currentStepIndex();
      exerciseElapsed += 1;
      if (currentStepIndex() !== previousStep) void beep();
      if (exerciseElapsed >= activeExercise.duration) {
        void saveCompletion(activeExercise, false);
        closePanel();
      } else {
        renderPanel(urgency);
      }
    }, 1000);
  };

  mount.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    if (!action) return;
    if (activeReminder) {
      if (action === 'start-reset') {
        closeReminder();
        void startBreak(activeUrgency);
      }
      if (action === 'disconnect') {
        snoozedUntil = Date.now() + 15 * 60_000;
        closeReminder();
      }
      if (action === 'reminder-snooze') {
        snoozedUntil = Date.now() + 10 * 60_000;
        closeReminder();
      }
      if (action === 'reminder-dismiss') closeReminder();
      return;
    }
    if (!activeExercise) return;
    if (action === 'close') closePanel();
    if (action === 'done') {
      void saveCompletion(activeExercise, exerciseElapsed < activeExercise.duration * 0.75);
      closePanel();
    }
    if (action === 'skip') {
      void saveMiss('skipped');
      closePanel();
    }
    if (action === 'snooze') {
      snoozedUntil = Date.now() + 10 * 60_000;
      void saveMiss('snoozed');
      closePanel();
    }
  });

  const onPointerMove = (event: PointerEvent) => {
    const now = Date.now();
    const distance = Math.hypot(event.clientX - lastPointer.x, event.clientY - lastPointer.y);
    const seconds = Math.max((now - lastPointer.time) / 1000, 0.016);
    signals.mouseVelocity = signals.mouseVelocity * 0.78 + (distance / seconds) * 0.22;
    lastPointer.x = event.clientX;
    lastPointer.y = event.clientY;
    lastPointer.time = now;
    markActive();
  };

  const onClick = () => {
    markActive();
  };

  const onKeyDown = () => {
    const now = Date.now();
    keyTimestamps = [...keyTimestamps, now].filter((timestamp) => now - timestamp < 60_000);
    const recentFiveSeconds = keyTimestamps.filter((timestamp) => now - timestamp < 5_000);
    if (recentFiveSeconds.length >= 12 && !burstStarted) {
      signals.typingBurstCount += 1;
      burstStarted = true;
    }
    if (recentFiveSeconds.length < 4) burstStarted = false;
    markActive();
  };

  const onScroll = () => {
    const now = Date.now();
    const distance = Math.abs(window.scrollY - lastScroll.y);
    const seconds = Math.max((now - lastScroll.time) / 1000, 0.016);
    const docHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, window.innerHeight);
    signals.scrollVelocity = signals.scrollVelocity * 0.76 + (distance / seconds) * 0.24;
    signals.scrollDepth = Math.max(signals.scrollDepth, Math.round((window.scrollY / docHeight) * 100));
    lastScroll.y = window.scrollY;
    lastScroll.time = now;
    lastActivity = now;
    lastInteractionAt = now;
  };

  const onVisibility = () => {
    signals.visibilityChanges += 1;
    if (!document.hidden) markActive();
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('click', onClick, { passive: true });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  if (category === 'social') {
    void (async () => {
      const stored = rollStats(mergeStats((await getStorage('xpauseStats')).xpauseStats as Partial<ExtensionStats> | undefined));
      stored.usage.today.socialVisits += 1;
      await setStorage({ xpauseStats: stored });
    })();
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (!message || typeof message !== 'object' || !('type' in message)) return;
    const nextSettings =
      'settings' in message && message.settings && typeof message.settings === 'object'
        ? ({ ...defaultSettings, ...(message.settings as Partial<ExtensionSettings>) } as ExtensionSettings)
        : null;
    if (message.type === 'XP_PAUSE_START_BREAK') {
      if (nextSettings) currentSettings = nextSettings;
      void startBreak('soft', undefined, nextSettings ?? undefined);
    }
    if (message.type === 'XP_PAUSE_SETTINGS_UPDATED') {
      if (nextSettings) {
        currentSettings = nextSettings;
        if (activeExercise) renderPanel(activeUrgency);
        if (activeReminder) renderReminder(activeReminder, activeUrgency, false);
      } else {
        void readStorage('xpauseSettings', defaultSettings).then((settings) => {
          currentSettings = settings;
          if (activeExercise) renderPanel(activeUrgency);
          if (activeReminder) renderReminder(activeReminder, activeUrgency, false);
        });
      }
    }
  });

  window.setInterval(() => {
    void (async () => {
      currentSettings = await readStorage('xpauseSettings', defaultSettings);
      const now = Date.now();
      const tickMs = document.hidden ? 0 : Math.max(0, now - lastTickAt);
      lastTickAt = now;
      const idleMs = now - lastActivity;
      if (idleMs > 5 * 60_000) eyeStrainStartedAt = now;
      const continuousUseMinutes = Math.max((now - sessionStart) / 60_000, currentSettings.sessionLengthMinutes - 25);
      const nextSignals = {
        ...signals,
        idleMs,
        keypressesPerMinute: keyTimestamps.filter((timestamp) => now - timestamp < 60_000).length,
        continuousUseMinutes
      };
      const result = scoreActivity(nextSignals, fatigueScore, currentSettings.sensitivity);
      fatigueScore = idleMs > 30_000 ? Math.round(clamp(fatigueScore - Math.min(idleMs / 12_000, 24))) : result.score;
      const stored = rollStats(mergeStats((await getStorage('xpauseStats')).xpauseStats as Partial<ExtensionStats> | undefined));
      const isActive = now - lastInteractionAt < 15_000 && (keyTimestamps.length > 0 || signals.mouseVelocity > 80);
      stored.usage.today.screenMs += tickMs;
      stored.usage.today.categories[category] += tickMs;
      stored.usage.today.activeMs += isActive ? tickMs : 0;
      stored.usage.today.passiveMs += isActive ? 0 : tickMs;
      stored.usage.today.scrollEvents += signals.scrollVelocity > 80 ? 1 : 0;
      const socialMinutes = stored.usage.today.categories.social / 60_000;
      const passiveRatio = stored.usage.today.screenMs > 0 ? stored.usage.today.passiveMs / stored.usage.today.screenMs : 0;
      socialFatigueScore = Math.round(
        clamp(socialMinutes * 1.45 + passiveRatio * 32 + Math.min(stored.usage.today.scrollEvents / 2, 20))
      );
      const eyeStrainMinutes = Math.floor((now - eyeStrainStartedAt) / 60_000);
      const insights = buildInsights(stored.usage.today, category, eyeStrainMinutes, socialFatigueScore);
      await setStorage({ xpauseStats: stored, xpauseInsights: insights });
      const urgency = idleMs > 30_000 ? getUrgency(fatigueScore, currentSettings.sensitivity) : result.urgency;
      await saveRuntime(fatigueScore, urgency, result.reasons);
      if (eyeStrainMinutes >= 20 && now - lastEyePromptAt > 20 * 60_000 && !activeExercise) {
        lastEyePromptAt = now;
        stored.usage.today.eyeStrainPrompts += 1;
        await setStorage({ xpauseStats: stored });
        void startBreak('soft', exercises[0]);
      }
      if (
        socialFatigueScore >= 70 &&
        category === 'social' &&
        now > snoozedUntil &&
        now - lastDisconnectPromptAt > 15 * 60_000 &&
        !activeExercise &&
        !activeReminder
      ) {
        lastDisconnectPromptAt = now;
        stored.usage.today.disconnectPrompts += 1;
        await setStorage({ xpauseStats: stored });
        renderReminder('social', 'urgent');
        if (currentSettings.notificationsEnabled) {
          sendRuntimeMessage({
            type: 'XP_PAUSE_NOTIFY',
            body: 'Social fatigue is high. Consider disconnecting for 15 minutes.'
          });
        }
      }
      if (
        urgency !== 'none' &&
        !activeExercise &&
        !activeReminder &&
        Date.now() > snoozedUntil &&
        now - lastFatiguePromptAt > 10 * 60_000
      ) {
        lastFatiguePromptAt = now;
        activeUrgency = urgency;
        renderReminder('fatigue', urgency);
      }
      signals.typingBurstCount = Math.max(0, signals.typingBurstCount - 1);
      signals.visibilityChanges = Math.max(0, signals.visibilityChanges - 1);
    })();
  }, 5_000);
};

install();
