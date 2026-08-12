/**
 * Mapa explícito de nome de ícone (padrão Lucide, igual aos icon_name do
 * catálogo — CONTEXT.md Seção 12) pro componente Lucide correspondente.
 * Mapa fixo e pequeno, não resolução dinâmica por string — o catálogo é
 * gerenciado só via seed/migration (CONTEXT.md Seção 6), então essa lista
 * só muda quando uma missão nova entra no seed.
 */

import {
  BookOpen,
  Book,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Compass,
  Dumbbell,
  Flame,
  Footprints,
  Lock,
  Moon,
  MonitorOff,
  Percent,
  PiggyBank,
  Plus,
  Quote,
  Share2,
  TrendingUp,
  Trophy,
  User,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react-native';

export const CATALOG_ICONS: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  book: Book,
  dumbbell: Dumbbell,
  footprints: Footprints,
  moon: Moon,
  'monitor-off': MonitorOff,
  wallet: Wallet,
  'piggy-bank': PiggyBank,
};

// Fallback pra um icon_name fora do mapa. Exportado (em vez de embrulhado
// numa função de lookup) de propósito: o eslint-plugin-react-hooks/
// static-components trata qualquer `const X = someFn(); <X />` como
// "componente criado durante o render", mesmo quando a função só faz uma
// leitura estável de mapa — então o lookup fica inline no callsite
// (`CATALOG_ICONS[name] ?? DEFAULT_CATALOG_ICON`), nunca atrás de uma
// função.
export const DEFAULT_CATALOG_ICON: LucideIcon = Compass;

export const UiIcons = {
  quote: Quote,
  profile: User,
  catalog: Compass,
  stats: TrendingUp,
  streak: Flame,
  add: Plus,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trophy: Trophy,
  share: Share2,
  close: X,
  lock: Lock,
  percent: Percent,
  missed: CircleX,
  check: CircleCheck,
} satisfies Record<string, LucideIcon>;
