# XPause

XPause is a local-first Chromium browser extension that tracks browsing activity patterns, estimates fatigue, and recommends micro-breaks directly on normal web pages.

## Quick Start

```bash
npm.cmd install
npm.cmd run build
```

Then load the extension:

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable Developer mode.
3. Choose "Load unpacked".
4. Select the `dist-extension` folder in this project directory.

After rebuilding, click the reload icon on the extension card.

## Commands

```bash
npm.cmd run build
npm.cmd run build:extension
npm.cmd run test
npm.cmd run lint
```

`build` and `build:extension` both produce the unpacked extension in `dist-extension/`.

## What It Tracks

- Fatigue score from pointer, keyboard, scroll, idle, and tab visibility signals.
- Social fatigue score from social-site time, passive scrolling, and repeated visits.
- Daily and weekly screen usage.
- Passive vs active interaction time.
- Usage categories: work, entertainment, and social.
- Eye-strain timer with 20-20-20 style Blink Exercise reminders.
- Local AI-style schedule suggestions derived from usage logs.

## Architecture

- `src/features/activity`: User telemetry (`ActivityTracker`), site categorizer (`classifyHost`), and fatigue scoring (`scoreActivity`, `decayFatigue`).
- `src/features/analytics`: Screen usage statistics rollup (`rollStats`, `mergeStats`), AI insight generator (`buildInsights`), and charts.
- `src/features/breaks`: Exercise definitions, in-page break overlay manager, shadow DOM host, and exercise timers.
- `src/features/dashboard`: Extension popup dashboard widgets (header, status strip, score cards, XP stats, badges).
- `src/features/settings`: User configuration controls (sensitivity, exercise toggles, theme switcher).
- `src/features/sound`: Web Audio API sound synthesizer and sound theme manager.
- `src/features/privacy`: On-device privacy policy layout.
- `src/shared/`: Shared storage wrapper, date helpers, formatters, and theme resolvers.
- `src/extension/`: Thin extension entry points (`contentScript.ts`, `popup.tsx`, `background.ts`).
- `vite.extension.config.ts`: Builds the Manifest V3 unpacked extension.

## Privacy

There is no backend. Usage analytics, scores, settings, XP, and history stay in the browser through `chrome.storage.local`.

## Browser Limitations

Content scripts cannot run on `chrome://`, `edge://`, extension pages, Chrome Web Store pages, or some protected browser pages. Test XPause on ordinary websites.
