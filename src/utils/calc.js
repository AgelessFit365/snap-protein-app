// src/utils/calc.js
import { formatISO, subDays, isToday, isYesterday } from "date-fns";

/** Returns YYYY-MM-DD for *today* in local time */
export function todayISO() {
  return formatISO(new Date(), { representation: "date" });
}

/** Returns YYYY-MM-DD for *yesterday* in local time */
export function isoYesterday() {
  return formatISO(subDays(new Date(), 1), { representation: "date" });
}

/**
 * When user logs for the first time today, bump the streak.
 * - If last log was today  -> no change
 * - If last log was yesterday -> increment
 * - Otherwise -> reset to 1
 * Always stamps streakLastDateISO to today on first log of the day.
 */
export function updateStreakOnFirstLog(prev = {}) {
  const now = new Date();
  const today = formatISO(now, { representation: "date" });

  const lastISO = prev.streakLastDateISO;
  const last = lastISO ? new Date(lastISO) : null;
  const lastValid = last && !isNaN(last.getTime());

  let streak = Number(prev.streakCount || 0);

  if (lastValid && isToday(last)) {
    // Already credited today — don’t increment; just keep today stamped.
    return {
      ...prev,
      streakCount: streak,
      streakLastDateISO: today,
      updatedAt: new Date().toISOString(),
    };
  }

  if (lastValid && isYesterday(last)) {
    streak += 1; // continued streak
  } else {
    streak = 1; // start/reset streak
  }

  return {
    ...prev,
    streakCount: streak,
    streakLastDateISO: today,
    updatedAt: new Date().toISOString(),
  };
}
