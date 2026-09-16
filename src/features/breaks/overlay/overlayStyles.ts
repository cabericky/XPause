export const overlayStyles = `
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

