import Svg, { Circle, G, Path } from 'react-native-svg';

/**
 * Ícones autorais pra barra de navegação principal — em vez de ícones
 * genéricos de biblioteca, desenhados na mesma linguagem geométrica da
 * marca do app (traço uniforme, cantos arredondados, anéis de progresso).
 * O de Missões reaproveita literalmente o motivo do anel do AppMark
 * (src/components/ui/app-mark.tsx), representando "várias missões em
 * andamento" de um jeito que nenhum ícone de estoque replicaria.
 */

export interface NavIconProps {
  color: string;
  size?: number;
  strokeWidth?: number;
}

export function NavHomeIcon({ color, size = 24, strokeWidth = 2 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 11 L12 4 L20 11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M6 11 V19 H18 V11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={16} r={1.3} fill={color} />
    </Svg>
  );
}

export function NavMissionsIcon({ color, size = 24, strokeWidth = 2 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G transform="rotate(-90 8 8)">
        <Circle
          cx={8}
          cy={8}
          r={6}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="28.3 9.4"
        />
      </G>
      <G transform="rotate(-90 18 17)">
        <Circle
          cx={18}
          cy={17}
          r={5}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="23.6 7.8"
        />
      </G>
    </Svg>
  );
}

export function NavProfileIcon({ color, size = 24, strokeWidth = 2 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8.2} r={3.4} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path
        d="M5 20 C5 15.2 8.2 12.8 12 12.8 C15.8 12.8 19 15.2 19 20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
