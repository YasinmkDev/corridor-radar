/**
 * Display formatting helpers for the design's plate/phone conventions.
 * These are pure string transforms — no engine or store access.
 */

/** "SWAT-4821" -> "SWAT - 4821" (the design's spaced plate form). */
export function formatPlate(plate: string): string {
  return plate.replace('-', ' - ');
}

/**
 * Design phone display: 3-7 grouping, e.g. "3455036900" -> "345 5036900".
 * The field placeholder keeps the design's 3-3-4 sample ("345 503 6900");
 * this helper is only for the display lines (OTP sent-to, Account).
 */
export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (d.length <= 3) return d;
  return `${d.slice(0, 3)} ${d.slice(3)}`;
}
