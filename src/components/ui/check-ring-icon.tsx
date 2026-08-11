import { useEffect, useRef } from 'react';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { Circle, G, Path, Svg } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const RADIUS = 9;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const OPEN_DASH = CIRCUMFERENCE * 0.75; // mesma proporção do AppMark/StreakRingIcon
const CHECK_LENGTH = 13.5; // comprimento aproximado do path do check, folga incluída
const ROTATE_DURATION = 420;
const CHECK_DURATION = 260;

interface CheckRingIconProps {
  /** true = feito (some vezes já chega assim; anima só na transição false→true) */
  done: boolean;
  color: string;
  size?: number;
}

/**
 * Ícone de check-in — reaproveita o motivo do anel (AppMark/StreakRingIcon):
 * ao confirmar, o anel gira sobre si mesmo "engolindo" a própria abertura
 * até fechar num círculo completo, e então um check se desenha por dentro.
 * Nada de troca de texto/tamanho no botão — é o ícone que carrega a
 * transição de estado.
 */
export function CheckRingIcon({ done, color, size = 22 }: CheckRingIconProps) {
  const rotation = useSharedValue(0);
  const ringClose = useSharedValue(done ? 1 : 0); // 0 = arco aberto, 1 = círculo fechado
  const checkDraw = useSharedValue(done ? 1 : 0); // 0 = escondido, 1 = desenhado

  const wasDone = useRef(done);

  useEffect(() => {
    if (!wasDone.current && done) {
      rotation.value = withTiming(360, { duration: ROTATE_DURATION, easing: Easing.out(Easing.cubic) });
      ringClose.value = withTiming(1, { duration: ROTATE_DURATION, easing: Easing.out(Easing.cubic) }, (finished) => {
        'worklet';
        if (finished) {
          checkDraw.value = withTiming(1, { duration: CHECK_DURATION, easing: Easing.out(Easing.ease) });
        }
      });
    }
    wasDone.current = done;
  }, [done, rotation, ringClose, checkDraw]);

  const ringAnimatedProps = useAnimatedProps(() => {
    const dash = OPEN_DASH + (CIRCUMFERENCE - OPEN_DASH) * ringClose.value;
    const gap = Math.max(CIRCUMFERENCE - dash, 0.01);
    return { strokeDasharray: `${dash} ${gap}` };
  });

  const groupAnimatedProps = useAnimatedProps(() => ({
    transform: `rotate(${-90 + rotation.value} 12 12)`,
  }));

  const checkAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - checkDraw.value),
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <AnimatedG animatedProps={groupAnimatedProps}>
        <AnimatedCircle
          cx={12}
          cy={12}
          r={RADIUS}
          stroke={color}
          strokeWidth={2.4}
          strokeLinecap="round"
          animatedProps={ringAnimatedProps}
        />
      </AnimatedG>
      <AnimatedPath
        d="M7.5 12.5 L10.5 15.5 L16.5 9"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={CHECK_LENGTH}
        animatedProps={checkAnimatedProps}
      />
    </Svg>
  );
}
