import Svg, { Circle, G } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

interface AppMarkProps {
  size?: number;
}

/**
 * Marca do Missão30 — um anel de progresso com um marcador, remetendo
 * direto à mecânica central do app (progresso num ciclo de 30 dias, com um
 * "você está aqui"). Minimalista de propósito: 2 formas, sem gradiente,
 * legível até em tamanhos pequenos (cabeçalho, favicon).
 */
export function AppMark({ size = 32 }: AppMarkProps) {
  const theme = useTheme();

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G transform="rotate(-90 24 24)">
        <Circle
          cx={24}
          cy={24}
          r={17}
          fill="none"
          stroke={theme.secondary}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="80 106.8"
        />
      </G>
      <Circle cx={7} cy={24} r={4} fill={theme.primary} />
    </Svg>
  );
}
