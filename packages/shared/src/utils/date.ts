/**
 * Shared date formatting and calculation utilities
 */

export function formatDate(isoDate: string, timezone?: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone || 'UTC'
  });
}

export function formatDateTime(isoDate: string, timezone?: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone || 'UTC'
  });
}

export function getDaysUntil(isoDate: string): number {
  if (!isoDate) return 0;
  const target = new Date(isoDate).getTime();
  const now = new Date().getTime();
  const diffMs = target - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function isPastDate(isoDate: string): boolean {
  if (!isoDate) return false;
  return new Date(isoDate).getTime() < new Date().getTime();
}
