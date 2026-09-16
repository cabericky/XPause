export type UsageRange = 'weekly' | 'monthly' | 'yearly';

export const today = (): string => new Date().toLocaleDateString('en-CA');

export const formatChartDate = (date: string, range: UsageRange): string => {
  if (!date) return '';
  const value = new Date(`${date}T00:00:00`);
  if (Number.isNaN(value.getTime())) return '';
  if (range === 'yearly') return value.toLocaleDateString(undefined, { month: 'short' });
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

