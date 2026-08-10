/**
 * Paleta e tokens do Missão30 — CONTEXT.md, Seção 9 (revisão: tema claro).
 * A paleta original dark-only foi substituída por um tema claro/quente,
 * derivado de uma prancha de referência (5 cores + 1 tom de apoio derivado
 * pra "falta permitida", que não tinha um candidato claro na paleta original).
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#16201F',
    textSecondary: '#5C6B5F',
    background: '#F2E9DC',
    backgroundElement: '#FBF7EF',
    backgroundSelected: '#E4D9C7',
    surfaceStrong: '#114B47',
    border: '#E4D9C7',
    textOnDark: '#F2E9DC',
    textOnDarkSecondary: '#B7C9C2',
    primary: '#D2795A',
    secondary: '#114B47',
    success: '#6FA894',
    current: '#114B47',
    warning: '#D9A441',
    locked: '#E4D9C7',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
} as const;

// Barra de navegação flutuante (tabs)/_layout.tsx: altura + inset lateral
// da barra em si, e a folga que as telas dentro do grupo (tabs) precisam
// reservar no rodapé pra não ficar encoberta (a barra é position:absolute).
export const TabBarHeight = 64;
export const TabBarSideInset = 20;
export const TabBarClearance = TabBarHeight + Spacing.five;

export const MaxContentWidth = 800;
