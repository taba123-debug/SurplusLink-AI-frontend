import { format, differenceInDays, parseISO, isPast, addDays } from 'date-fns';

/**
 * Returns the number of days remaining until the given ISO date string.
 */
export function getDaysRemaining(dateString: string): number {
  try {
    const target = parseISO(dateString);
    return differenceInDays(target, new Date());
  } catch {
    return 0;
  }
}

/**
 * Formats date into a human-readable string.
 * Example: "18 Nov 2026"
 */
export function formatDate(dateString: string): string {
  try {
    const target = parseISO(dateString);
    return format(target, 'dd MMM yyyy');
  } catch {
    return dateString;
  }
}

/**
 * Formats date and time into a human-readable string.
 * Example: "18 Nov 2026, 04:30 PM"
 */
export function formatDateTime(dateString: string): string {
  try {
    const target = parseISO(dateString);
    return format(target, 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateString;
  }
}

/**
 * Generates an ISO date string offset by N days from today.
 * Useful for realistic seed data generation.
 */
export function offsetDays(days: number): string {
  return addDays(new Date(), days).toISOString();
}

/**
 * Returns shelf life urgency indicator:
 * 'critical': <= 7 days
 * 'moderate': 8 - 30 days
 * 'healthy': > 30 days
 */
export function getShelfLifeUrgency(daysRemaining: number): 'critical' | 'moderate' | 'healthy' {
  if (daysRemaining <= 7) return 'critical';
  if (daysRemaining <= 30) return 'moderate';
  return 'healthy';
}
