// Design System Colors matching user's exact Tailwind token config
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceBright?: string;
  surfaceDim?: string;
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;
  primaryFixed?: string;
  primaryFixedDim?: string;
  secondary: string;
  secondaryContainer: string;
  onSecondary: string;
  onSecondaryContainer: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  tertiary: string;
  tertiaryContainer: string;
  onTertiary: string;
  onTertiaryContainer?: string;
  tertiaryFixed?: string;
  error: string;
  star: string;
  isDark: boolean;
}

export const LIGHT_THEME: ThemeColors = {
  background: '#fcf9f4',
  surface: '#fcf9f4',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f6f3ee',
  surfaceContainer: '#f0ede9',
  surfaceContainerHigh: '#ebe8e3',
  surfaceContainerHighest: '#e5e2dd',
  surfaceBright: '#fcf9f4',
  surfaceDim: '#dcdad5',
  primary: '#322214',
  primaryContainer: '#4a3728',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#bba08c',
  primaryFixed: '#fbddc7',
  primaryFixedDim: '#dec1ac',
  secondary: '#6b5c4c',
  secondaryContainer: '#f4dfcb',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#716252',
  onSurface: '#1c1c19',
  onSurfaceVariant: '#4e453e',
  outline: '#80756d',
  outlineVariant: '#d2c4bb',
  tertiary: '#29251c',
  tertiaryContainer: '#403a31',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#aca498',
  tertiaryFixed: '#ebe1d4',
  error: '#ba1a1a',
  star: '#F59E0B',
  isDark: false,
};

export const DARK_THEME: ThemeColors = {
  background: '#161311',
  surface: '#161311',
  surfaceContainerLowest: '#110d0c',
  surfaceContainerLow: '#1f1b19',
  surfaceContainer: '#231f1d',
  surfaceContainerHigh: '#2e2927',
  surfaceContainerHighest: '#393431',
  surfaceBright: '#3d3836',
  surfaceDim: '#161311',
  primary: '#f2be8c',
  primaryContainer: '#d4a373',
  onPrimary: '#482904',
  onPrimaryContainer: '#5b3912',
  primaryFixed: '#ffdcbd',
  primaryFixedDim: '#f0bd8b',
  secondary: '#e9be9e',
  secondaryContainer: '#5e4028',
  onSecondary: '#442b14',
  onSecondaryContainer: '#ffdcc2',
  onSurface: '#eae1dd',
  onSurfaceVariant: '#d4c4b7',
  outline: '#9c8e82',
  outlineVariant: '#50453b',
  tertiary: '#bccdb7',
  tertiaryContainer: '#a1b19c',
  onTertiary: '#263425',
  onTertiaryContainer: '#364434',
  tertiaryFixed: '#d7e7d1',
  error: '#ffb4ab',
  star: '#f2be8c',
  isDark: true,
};

// Default export for compatibility
export const THEME = LIGHT_THEME;
