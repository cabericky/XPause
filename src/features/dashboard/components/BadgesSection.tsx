import React, { useMemo } from 'react';
import type { ExtensionStats } from '../../../types';

interface BadgesSectionProps {
  stats: ExtensionStats;
}

export const BadgesSection: React.FC<BadgesSectionProps> = ({ stats }) => {
  const badges = useMemo(
    () => [
      {
        label: 'Eye Guardian',
        description: 'Complete 20 blink exercises',
        unlocked: stats.completedByExercise.blink >= 20,
      },
      {
        label: 'Iron Wrists',
        description: 'Complete 7 wrist stretch exercises',
        unlocked: stats.completedByExercise.wrist >= 7,
      },
      {
        label: 'Calm Neck',
        description: 'Complete 10 neck rotation exercises',
        unlocked: stats.completedByExercise.neck >= 10,
      },
      {
        label: 'XP Spark',
        description: 'Earn 1000 total XP',
        unlocked: stats.xp >= 1000,
      },
    ],
    [stats],
  );

  return (
    <section className="badges" aria-label="Achievements">
      {badges.map((badge) => (
        <span
          className={badge.unlocked ? 'unlocked' : ''}
          key={badge.label}
          title={`${badge.label}: ${badge.description} (${badge.unlocked ? 'Unlocked' : 'Locked'})`}
        >
          {badge.label}
        </span>
      ))}
    </section>
  );
};
