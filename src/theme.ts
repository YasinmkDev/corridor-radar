/**
 * Warm Apricot Corridor — the user's own design system, from
 * warm_apricot_corridor/DESIGN.md. This file is the single token source:
 * no screen may use a hex literal or a fontSize/lineHeight outside it.
 *
 * Fonts: Plus Jakarta Sans (headlines) + Inter (body) via expo-font and
 * @expo-google-fonts. Each weight is its own family name, so type entries
 * set fontFamily only and never fontWeight — setting both breaks the
 * weight lookup on Android. If the fonts have not loaded yet, React
 * Native falls back to the system font at the same sizes.
 *
 * Shadows are the design's own soft warm shadows (warm-tinted, subtle).
 * Never neon, never coloured glow, never gradients.
 */

export const colors = {
  /** Creamy warm alabaster canvas. */
  canvas: '#FFFBF5',
  /** Pure white card surface. */
  card: '#FFFFFF',
  /** Delicate peach-tinted card border. */
  cardBorder: '#FED7AA',
  /** Deep warm charcoal text. */
  ink: '#1C1917',
  /** Warm secondary text. */
  inkSecondary: '#5A4138',
  /** Muted outline text. */
  muted: '#8E7166',
  /** Warm neutral border. */
  outline: '#E2BFB2',
  /** Low container surface. */
  surfaceLow: '#F7F3ED',
  /** Container surface. */
  surface: '#F1EDE7',
  /** Warm Amber Coral — primary actions and CTAs. */
  primary: '#EA580C',
  /** Deep accent for pressed/emphasis states. */
  primaryDeep: '#A33900',
  /** Strong container (secondary accents, progress). */
  primaryContainer: '#CC4900',
  /** Vibrant soft orange — secondary accents, live pulses. */
  secondary: '#F97316',
  /** Soft apricot container (chips, active segments, selected rows). */
  apricot: '#FFEDD5',
  /** Peach glow (borders, high-demand fills). */
  apricotDeep: '#FED7AA',
  /** Royal indigo — reserved for family/ladies seating ONLY. */
  family: '#4338CA',
  /** Lavender-indigo wash for family badges. */
  familyTint: '#EEF2FF',
  /** Success green (verified, confirmed). */
  success: '#15803D',
  /** Bright success green. */
  successBright: '#16A34A',
  /** Soft green wash. */
  successTint: '#DCFCE7',
  /** Error red. */
  error: '#BA1A1A',
  /** Soft red wash. */
  errorTint: '#FFDAD6',
  /** High-demand fill (peach glow) with charcoal text. */
  demandBg: '#FED7AA',
  /** White text on primary. */
  white: '#FFFFFF',
};

/** Font family names (expo-google-fonts). One name per weight. */
export const fonts = {
  jakarta800: 'PlusJakartaSans_800ExtraBold',
  jakarta700: 'PlusJakartaSans_700Bold',
  jakarta600: 'PlusJakartaSans_600SemiBold',
  inter700: 'Inter_700Bold',
  inter600: 'Inter_600SemiBold',
  inter500: 'Inter_500Medium',
  inter400: 'Inter_400Regular',
};

export const typeScale = {
  /** Display headlines (Plus Jakarta Sans 800). */
  display: { fontFamily: fonts.jakarta800, fontSize: 28, lineHeight: 34 },
  headline: { fontFamily: fonts.jakarta700, fontSize: 24, lineHeight: 30 },
  headlineMd: { fontFamily: fonts.jakarta700, fontSize: 20, lineHeight: 26 },
  headlineSm: { fontFamily: fonts.jakarta600, fontSize: 18, lineHeight: 24 },
  /** Body copy (Inter 500). */
  body: { fontFamily: fonts.inter500, fontSize: 16, lineHeight: 24 },
  bodySm: { fontFamily: fonts.inter400, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: fonts.inter400, fontSize: 12, lineHeight: 16 },
  labelLg: { fontFamily: fonts.inter700, fontSize: 14, lineHeight: 18 },
  labelMd: { fontFamily: fonts.inter600, fontSize: 12, lineHeight: 16 },
  labelSm: { fontFamily: fonts.inter700, fontSize: 10, lineHeight: 14 },
  /** Large numerals (ETA, seat counts). */
  loud: { fontFamily: fonts.jakarta800, fontSize: 28, lineHeight: 34 },
  step: { fontFamily: fonts.jakarta700, fontSize: 20, lineHeight: 26 },
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, huge: 64 };

export const radius = { card: 16, micro: 8, input: 12, sheet: 24, pill: 999 };

export const touch = { standard: 56, driverPrimary: 64 };

/** The design's own warm shadows (RN approximation of the CSS levels). */
export const shadows = {
  /** Level 1 — soft-touch cards. */
  card: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
  /** Level 2 — floating sheets and drawers. */
  sheet: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  /** Level 3 — tactile CTAs and pills. */
  cta: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};
