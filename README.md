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
4. Select `A:\XPause\dist-extension`.

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

- `src/extension/contentScript.ts` runs on normal `http` and `https` pages, monitors activity, stores analytics in `chrome.storage.local`, and injects the break overlay.
- `src/extension/popup.tsx` renders the extension dashboard, settings, social fatigue, category splits, eye-strain timer, and schedule suggestions.
- `src/extension/background.ts` handles extension notifications.
- `vite.extension.config.ts` builds the Manifest V3 unpacked extension.
- `src/utils/fatigueScorer.ts` contains the tested fatigue scoring logic used by the shared model.

## Privacy

There is no backend. Usage analytics, scores, settings, XP, and history stay in the browser through `chrome.storage.local`.

## Browser Limitations

Content scripts cannot run on `chrome://`, `edge://`, extension pages, Chrome Web Store pages, or some protected browser pages. Test XPause on ordinary websites.
