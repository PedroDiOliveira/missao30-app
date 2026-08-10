import { Colors } from '@/constants/theme';

// Missão30 usa um único tema claro (CONTEXT.md, Seção 3, Decisão #11) —
// não segue o esquema de cor do sistema operacional.
export function useTheme() {
  return Colors.light;
}
