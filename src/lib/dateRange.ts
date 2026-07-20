import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import type { RangeMode } from "@/components/DateRangeBar";

/**
 * Parses a "YYYY-MM-DD" <input type="date"> value as a LOCAL calendar date.
 * `new Date("YYYY-MM-DD")` parses as UTC midnight, which silently shifts to
 * the previous day in any timezone behind UTC — this avoids that footgun.
 */
export function parseLocalDateInput(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Returns the precise start/end instants for the given range, in the
 * browser's local timezone — e.g. "day" mode always spans that exact
 * calendar day from 00:00:00.000 to 23:59:59.999 locally, not a fixed
 * server-side UTC window. */
export function computeDateRange(mode: RangeMode, dateStr: string): { from: Date; to: Date } {
  const date = parseLocalDateInput(dateStr);
  if (mode === "week") {
    return {
      from: startOfWeek(date, { weekStartsOn: 1 }),
      to: endOfWeek(date, { weekStartsOn: 1 }),
    };
  }
  if (mode === "month") {
    return { from: startOfMonth(date), to: endOfMonth(date) };
  }
  return { from: startOfDay(date), to: endOfDay(date) };
}
