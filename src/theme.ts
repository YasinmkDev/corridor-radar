export const colors = {
  canvas: '#F8FAFC',
  card: '#FFFFFF',
  white: '#FFFFFF',
  night: '#0F172A',
  nightCard: '#1E293B',
  nightHairline: '#334155',
  ink: '#0F172A',
  inkSecondary: '#475569',
  nightText: '#F1F5F9',
  nightSecondary: '#CBD5E1',
  hairline: '#E2E8F0',
  emerald: '#059669',
  emeraldBright: '#10B981',
  emeraldTint: '#D1FAE5',
  /** Dark emerald text on light surfaces. AAA on canvas, tint, and white. */
  emeraldText: '#064E3B',
  /**
   * Primary action + selected-state fill. AAA (9.72) with white text.
   * Mid emerald #059669 is reserved for non-text accents (dots, borders,
   * icons on white) because white text on it is only 3.77:1 (fails AA).
   */
  emeraldAction: '#064E3B',
  /** Bright emerald text on dark surfaces. AAA on nightCard. */
  emeraldLight: '#6EE7B7',
  amber: '#D97706',
  amberBright: '#F59E0B',
  amberTint: '#FEF3C7',
  /** Dark amber text on light surfaces. AAA on tint and white. */
  amberText: '#78350F',
  /** Amber icon on light surfaces. AAA on white. */
  amberDeep: '#92400E',
  indigo: '#4F46E5',
  indigoTint: '#E0E7FF',
  /** Dark indigo text on light surfaces. AAA on indigoTint. */
  indigoText: '#312E81',
  danger: '#DC2626',
  dangerTint: '#FEE2E2',
  /** Dark red text on light surfaces. AAA on dangerTint. */
  dangerText: '#7F1D1D',
  /** Light red text and icons on dark surfaces. AAA on nightCard. */
  dangerLight: '#FCA5A5',
};

export const typeScale = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '800' as const },
  subtitle: { fontSize: 16, lineHeight: 22, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, lineHeight: 22, fontWeight: '700' as const },
  /** Button and primary-action labels: one size, one weight, everywhere. */
  button: { fontSize: 16, lineHeight: 22, fontWeight: '700' as const },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  smallBold: { fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
  tiny: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  plate: { fontSize: 14, lineHeight: 20, fontWeight: '800' as const, letterSpacing: 1.5 },
  /** Stepper glyphs (−/+) only. The seat numeral itself uses `loud`. */
  step: { fontSize: 32, lineHeight: 36, fontWeight: '800' as const },
  /**
   * The product's ONE loud moment: the driver's glanceable seat numeral.
   * Nothing else uses this size.
   */
  loud: { fontSize: 48, lineHeight: 56, fontWeight: '800' as const },
};

/** Minimum touch targets: 56px everywhere, 64px for driver primary actions. */
export const touch = {
  standard: 56,
  driverPrimary: 64,
};

/**
 * Radii vocabulary, each with one job:
 * - card (16): content cards and large primary action blocks.
 * - pill (999): selectors, mode switcher, toggle pills.
 * - chip (10): small data chips and badges.
 */
export const radius = {
  card: 16,
  pill: 999,
  chip: 10,
};

/**
 * The canonical spacing scale. Every padding, gap, and margin in the app
 * must be one of these values (verified by grep). Borders and hairlines
 * (1–3px) and fixed component geometry (dots, tracks) are exempt.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
};

/**
 * Motion tokens. No timed animation ships in this pass: press feedback is
 * an instant (<100ms) opacity/scale state change, so there is no spatial
 * motion to convert under Reduce Motion. These tokens govern any future
 * timed motion: press 100–160ms, exits shorter than enters, stagger totals
 * capped at 500ms, first screenful only, never a spring on progress.
 */
export const motion = {
  press: 150,
  fast: 175,
  base: 275,
  stagger: 40,
  maxSequence: 500,
};
