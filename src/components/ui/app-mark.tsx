import Svg, { Circle, G } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

interface AppMarkProps {
  size?: number;
  /** Renderiza o anel em `textOnDark` em vez de `secondary` — necessário
   * sempre que a marca aparece sobre uma superfície escura (ex.: o card
   * hero do perfil, `variant="strong"` do SurfaceCard), já que o fundo
   * dessas superfícies É `theme.secondary` — sem isso o anel fica
   * invisível, some contra o próprio fundo. */
  onDark?: boolean;
}

/**
 * Marca do Missão30 — um anel de progresso com um marcador, remetendo
 * direto à mecânica central do app (progresso num ciclo de 30 dias, com um
 * "você está aqui"). Minimalista de propósito: 2 formas, sem gradiente,
 * legível até em tamanhos pequenos (cabeçalho, favicon).
 */
export function AppMark({ size = 32, onDark = false }: AppMarkProps) {
  const theme = useTheme();
  const ringColor = onDark ? theme.textOnDark : theme.secondary;

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G transform="rotate(-90 24 24)">
        <Circle
          cx={24}
          cy={24}
          r={17}
          fill="none"
          stroke={ringColor}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="80 106.8"
        />
      </G>
      <Circle cx={7} cy={24} r={4} fill={theme.primary} />
    </Svg>
  );
}
