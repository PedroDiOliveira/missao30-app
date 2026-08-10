import { Colors } from '@/constants/theme';

// Missão30 é dark-only no MVP (CONTEXT.md, Seção 3, Decisão #4) —
// não segue o esquema de cor do sistema operacional.
export function useTheme() {
  return Colors.dark;
}
