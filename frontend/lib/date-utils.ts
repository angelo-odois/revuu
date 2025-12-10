/**
 * Centralized date formatting utilities
 *
 * This file provides consistent date formatting across the application.
 * Import these utilities instead of duplicating date logic in components.
 */

export type DateLocale = "pt-BR" | "en-US";

// Default locale for the application
const DEFAULT_LOCALE: DateLocale = "pt-BR";

/**
 * Format a date string to a short month/year format
 * e.g., "Jan 2024" or "Jan 2024"
 */
export function formatDate(
  dateString: string | Date,
  locale: DateLocale = DEFAULT_LOCALE
): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString(locale, { month: "short", year: "numeric" });
}

/**
 * Format a date string to a short format for charts
 * e.g., "02 Jan" or "15 Fev"
 */
export function formatChartDate(
  date: Date | string,
  locale: DateLocale = DEFAULT_LOCALE
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, { day: "2-digit", month: "short" });
}

/**
 * Format a date range string
 * e.g., "Jan 2020 - Mar 2024" or "Jan 2020 - Presente"
 */
export function formatDateRange(
  startDate: string | Date,
  endDate?: string | Date | null,
  isCurrent?: boolean,
  locale: DateLocale = DEFAULT_LOCALE
): string {
  const start = formatDate(startDate, locale);

  if (isCurrent) {
    return `${start} - ${locale === "pt-BR" ? "Presente" : "Present"}`;
  }

  if (endDate) {
    return `${start} - ${formatDate(endDate, locale)}`;
  }

  return start;
}

/**
 * Format a date for terminal-style display (English)
 * e.g., "Jan 2024 → HEAD" or "Jan 2024 → Mar 2024"
 */
export function formatTerminalDate(
  startDate: string | Date,
  endDate?: string | Date | null,
  isCurrent?: boolean
): string {
  const start = formatDate(startDate, "en-US");

  if (isCurrent) {
    return `${start} → HEAD`;
  }

  if (endDate) {
    return `${start} → ${formatDate(endDate, "en-US")}`;
  }

  return start;
}

/**
 * Format a full date with day
 * e.g., "15 de Janeiro de 2024" or "January 15, 2024"
 */
export function formatFullDate(
  dateString: string | Date,
  locale: DateLocale = DEFAULT_LOCALE
): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format a relative time string
 * e.g., "há 2 horas" or "2 hours ago"
 */
export function formatRelativeTime(
  dateString: string | Date,
  locale: DateLocale = DEFAULT_LOCALE
): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (locale === "pt-BR") {
    if (diffInMinutes < 1) return "agora mesmo";
    if (diffInMinutes < 60) return `há ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`;
    if (diffInHours < 24) return `há ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;
    if (diffInDays < 7) return `há ${diffInDays} ${diffInDays === 1 ? "dia" : "dias"}`;
    return formatDate(date, locale);
  }

  // English
  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  return formatDate(date, locale);
}

/**
 * Get the ISO date string (YYYY-MM-DD) from a date
 */
export function toISODateString(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}
