import React, { useMemo } from 'react';
import type { ExtensionStats } from '../../../types';

interface BadgesSectionProps {
  stats: ExtensionStats;
}

export const BadgesSection: React.FC<BadgesSectionProps> = ({ stats }) => {
  const badges = useMemo(
    () => [
      { label: 'Eye Guardian', unlocked: stats.completedByExercise.blink >= 20 },
      { label: 'Iron Wrists', unlocked: stats.completedByExercise.wrist >= 7 },
      { label: 'Calm Neck', unlocked: stats.completedByExercise.neck >= 10 },
      { label: 'XP Spark', unlocked: stats.xp >= 1000 }
    ],
    [stats]
  );

  return (
    <section className="badges">
      {badges.map((badge) => (
        <span className={badge.unlocked ? 'unlocked' : ''} key={badge.label}>
          {badge.label}
        </span>
      ))}
    </section>
  );
};

