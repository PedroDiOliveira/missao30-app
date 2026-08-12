import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ghost loading — retângulo pulsando no lugar de conteúdo ainda não
 * carregado (CONTEXT.md Log de Decisões #18). Reaproveita `theme.border`
 * (o mesmo bege suave já usado em bordas/dias bloqueados na grade) em vez
 * de criar uma cor nova só pra isso.
 */
export function Skeleton({ width = '100%', height = 16, borderRadius = Radius.sm, style }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.5, { duration: 700 })),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: theme.border }, animatedStyle, style]}
    />
  );
}
