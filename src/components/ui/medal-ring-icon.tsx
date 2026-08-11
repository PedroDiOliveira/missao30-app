import Svg, { Circle, G } from 'react-native-svg';

import type { MedalTier } from '@/lib/medals';

interface MedalRingIconProps {
  tier: MedalTier;
  color: string;
  size?: number;
}

// Circunferência do círculo (r=9) ≈ 56.5 — cada nível reparte esse total
// entre traço e vão. Nível 1 fecha por completo; do 2 pro 3 o vão cresce,
// então a própria forma do anel comunica o nível, sem precisar de ícones
// diferentes ou texto (mesma técnica de AppMark/StreakRingIcon).
const TIER_DASH: Record<MedalTier, string | undefined> = {
  1: undefined,
  2: '50 6.5',
  3: '40 16.5',
};

/** Ícone de medalha — reaproveita o motivo de anel da marca (AppMark,
 * StreakRingIcon) em vez de um ícone de medalha genérico. */
export function MedalRingIcon({ tier, color, size = 28 }: MedalRingIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G transform="rotate(-90 12 12)">
        <Circle
          cx={12}
          cy={12}
          r={9}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={TIER_DASH[tier]}
        />
      </G>
    </Svg>
  );
}
