import type { BreakUrgency, ExerciseDefinition } from '../../../types';

export const getStepIndex = (exercise: ExerciseDefinition, elapsed: number): number => {
  let cursor = 0;
  for (let index = 0; index < exercise.steps.length; index += 1) {
    cursor += exercise.steps[index].duration;
    if (elapsed < cursor) return index;
  }
  return exercise.steps.length - 1;
};

export const patchExercisePanel = (
  existingPanel: HTMLElement,
  exercise: ExerciseDefinition,
  stepIndex: number,
  elapsed: number,
): boolean => {
  if (existingPanel.getAttribute('data-exercise-id') !== exercise.id) {
    return false;
  }

  const step = exercise.steps[stepIndex];
  const remaining = Math.max(0, exercise.duration - elapsed);
  const progress = Math.min(100, (elapsed / exercise.duration) * 100);

  const ring = existingPanel.querySelector('.xp-ring') as HTMLElement | null;
  if (ring) {
    ring.style.setProperty('--progress', `${progress}%`);
    const strong = ring.querySelector('strong');
    if (strong) strong.textContent = remaining.toString();
  }

  const copyH3 = existingPanel.querySelector('.xp-copy h3');
  if (copyH3) copyH3.textContent = step.label;

  const copyP = existingPanel.querySelector('.xp-copy p');
  if (copyP) copyP.textContent = step.cue;

  const dots = existingPanel.querySelectorAll('.xp-dots span');
  dots.forEach((dot, index) => {
    dot.className = index <= stepIndex ? 'active' : '';
  });

  return true;
};

export const renderExercisePanelHtml = (
  exercise: ExerciseDefinition,
  stepIndex: number,
  elapsed: number,
  urgency: BreakUrgency,
  theme: 'light' | 'dark',
): string => {
  const step = exercise.steps[stepIndex];
  const remaining = Math.max(0, exercise.duration - elapsed);
  const progress = Math.min(100, (elapsed / exercise.duration) * 100);
  const themeClass = `xp-theme-${theme}`;
  const imageUrl =
    typeof chrome !== 'undefined' && chrome?.runtime?.getURL
      ? chrome.runtime.getURL(`assets/exercises/${exercise.id}.webp`)
      : `/src/assets/exercises/${exercise.id}.webp`;

  return `
    <aside class="xp-panel ${themeClass} ${urgency}" data-exercise-id="${exercise.id}" role="dialog" aria-modal="${urgency === 'critical'}" aria-labelledby="xpause-title">
      <div class="xp-top">
        <div>
          <p class="xp-eyebrow">${urgency === 'critical' ? 'Critical reset' : 'XPause micro-break'}</p>
          <h2 id="xpause-title">${exercise.title}</h2>
        </div>
        <button class="xp-close" type="button" data-action="close" aria-label="Dismiss">X</button>
      </div>
      <div class="xp-visual ${exercise.id}" aria-hidden="true">
        <img class="xp-exercise-media" src="${imageUrl}" alt="${exercise.title}" width="88" height="88" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='block';" />
        <span class="xp-shape" style="display:none"></span>
      </div>
      <div class="xp-ring" style="--progress: ${progress}%"><strong>${remaining}</strong><span>sec</span></div>
      <div class="xp-copy"><h3>${step.label}</h3><p>${step.cue}</p></div>
      <div class="xp-dots" aria-label="Step ${stepIndex + 1} of ${exercise.steps.length}">
        ${exercise.steps.map((item, index) => `<span class="${index <= stepIndex ? 'active' : ''}" title="${item.label}"></span>`).join('')}
      </div>
      <div class="xp-actions">
        <button class="xp-secondary" type="button" data-action="snooze">Snooze</button>
        <button class="xp-secondary" type="button" data-action="skip">Skip</button>
        <button class="xp-primary" type="button" data-action="done">Done</button>
      </div>
    </aside>
  `;
};
