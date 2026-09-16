import React, { useMemo } from 'react';
import type { UsageDay } from '../../../types';
import { formatChartDate, type UsageRange } from '../../../shared/utils/date';
import { formatDuration } from '../../../shared/utils/formatters';
import { emptyUsageDay } from '../stats';

interface UsageChartProps {
  usageDays: UsageDay[];
  range: UsageRange;
}

export const UsageChart: React.FC<UsageChartProps> = ({ usageDays, range }) => {
  const usageChart = useMemo(() => {
    const baseDays = [...usageDays];
    const buckets: Array<{ key: string; label: string; screenMs: number }> = [];

    if (range === 'weekly') {
      const days = baseDays.slice(-7);
      while (days.length < 7) days.unshift(emptyUsageDay(''));
      return days.map((day, index) => ({
        key: day.date || `empty-week-${index}`,
        label: formatChartDate(day.date, range),
        screenMs: day.screenMs
      }));
    }

    if (range === 'monthly') {
      const days = baseDays.slice(-30);
      while (days.length < 30) days.unshift(emptyUsageDay(''));
      for (let index = 0; index < 6; index += 1) {
        const slice = days.slice(index * 5, index * 5 + 5);
        const firstDate = slice.find((day) => day.date)?.date ?? '';
        buckets.push({
          key: firstDate || `empty-month-${index}`,
          label: firstDate ? formatChartDate(firstDate, range) : '',
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
      label: key ? formatChartDate(`${key}-01`, range) : '',
      screenMs: key ? (months.get(key) ?? 0) : 0
    }));
  }, [usageDays, range]);

  const maxChartScreenMs = Math.max(1, ...usageChart.map((item) => item.screenMs));

  return (
    <div
      className="usage-chart column-chart"
      aria-label={`${range} screen usage column chart`}
    >
      {usageChart.map((item) => (
        <div className="usage-chart-item" key={item.key}>
          <div className="usage-chart-track">
            <span
              style={{
                height: `${Math.max(6, (item.screenMs / maxChartScreenMs) * 92)}px`
              }}
              title={
                item.label
                  ? `${item.label}: ${formatDuration(item.screenMs)}`
                  : 'No data'
              }
            />
          </div>
          <small>{item.label || '-'}</small>
        </div>
      ))}
    </div>
  );
};

