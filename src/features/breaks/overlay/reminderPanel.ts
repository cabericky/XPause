import type { BreakUrgency, ReminderKind } from '../../../types';

export const renderReminderPanelHtml = (
  kind: ReminderKind,
  urgency: BreakUrgency,
  score: number,
  theme: 'light' | 'dark'
): string => {
  const themeClass = `xp-theme-${theme}`;
  const isSocial = kind === 'social';

  return `
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

