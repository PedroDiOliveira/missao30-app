import Svg, { Circle, G } from 'react-native-svg';

interface StreakRingIconProps {
  color: string;
  size?: number;
}

/** Mini anel de progresso — mesmo motivo do AppMark e do ícone de Missões,
 * de propósito: reforça a marca em vez de recorrer ao ícone de fogo que
 * praticamente todo app de streak usa (e que carrega uma conotação de "não
 * deixe apagar" meio oposta à filosofia de tolerância do produto). Extraído
 * de `streak-badge.tsx` pra ser reusado também no detalhe da missão. */
export function StreakRingIcon({ color, size = 18 }: StreakRingIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G transform="rotate(-90 12 12)">
        <Circle
          cx={12}
          cy={12}
          r={9}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray="42 14.1"
        />
      </G>
    </Svg>
  );
}
