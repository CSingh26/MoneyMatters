// ─── PolicyLens AI Design Tokens ───

export const Colors = {
  // Primary Palette
  primary50: '#F0EDFF',
  primary100: '#DDD6FE',
  primary200: '#C4B5FD',
  primary300: '#A78BFA',
  primary400: '#8B5CF6',
  primary500: '#6C5CE7',
  primary600: '#5B47D0',
  primary700: '#4C3DB5',
  primary800: '#3B2F8A',
  primary900: '#2A2063',

  // Blue Accents
  blue50: '#EBF5FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue300: '#93C5FD',
  blue400: '#74B9FF',
  blue500: '#3B82F6',
  blue600: '#2563EB',

  // Lavender Accents
  lavender100: '#E8E4F8',
  lavender200: '#D1C4E9',
  lavender300: '#B39DDB',
  lavender400: '#A29BFE',

  // Neutral
  gray50: '#F8F9FE',
  gray100: '#F1F3F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#636E72',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#2D3436',
  gray900: '#1A1A2E',

  // Semantic
  success: '#00B894',
  successLight: '#E6F9F3',
  warning: '#FDCB6E',
  warningLight: '#FFF8E7',
  danger: '#FF7675',
  dangerLight: '#FFE8E8',
  info: '#74B9FF',
  infoLight: '#EBF5FF',

  // Surfaces
  bgPrimary: '#F8F9FE',
  bgSecondary: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
};

export const FontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.primary500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.primary500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.primary500,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
};

// ─── Shared Style Mixins ───
export const CardStyle = {
  backgroundColor: Colors.white,
  borderRadius: Radii.lg,
  borderWidth: 1,
  borderColor: 'rgba(108, 92, 231, 0.06)',
  ...Shadows.sm,
};

export const InputStyle = {
  backgroundColor: Colors.gray50,
  borderWidth: 1.5,
  borderColor: Colors.gray200,
  borderRadius: Radii.md,
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.md,
  fontSize: FontSizes.md,
  color: Colors.gray800,
};

export const ButtonPrimaryStyle = {
  backgroundColor: Colors.primary500,
  borderRadius: Radii.md,
  paddingVertical: 14,
  paddingHorizontal: Spacing.xxl,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: Spacing.sm,
  ...Shadows.md,
};

export const BadgeStyle = {
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.xs,
  borderRadius: Radii.full,
  alignSelf: 'flex-start',
};
