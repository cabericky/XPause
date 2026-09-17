import React from 'react';
import { Activity, MousePointer2, ShieldCheck } from 'lucide-react';
import type { BreakUrgency, UsageCategory } from '../../../types';

interface StatusStripProps {
  urgency: BreakUrgency;
  category: UsageCategory;
}

export const StatusStrip: React.FC<StatusStripProps> = ({ urgency, category }) => {
  return (
    <section className="status-strip" aria-label="Current monitoring status">
      <span>
        <ShieldCheck size={14} />
        On-device
      </span>
      <span>
        <Activity size={14} />
        {urgency === 'none' ? 'Steady' : urgency}
      </span>
      <span>
        <MousePointer2 size={14} />
        {category}
      </span>
    </section>
  );
};
