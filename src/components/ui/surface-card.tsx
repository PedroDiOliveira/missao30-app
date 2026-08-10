import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface SurfaceCardProps extends Omit<ViewProps, 'style'> {
  onPress?: () => void;
  variant?: 'default' | 'strong';
  style?: StyleProp<ViewStyle>;
}

/**
 * Wrapper visual único pros ~5 tipos de card do dashboard — cantos
 * arredondados, cor de fundo/borda via useTheme(), padding consistente.
 * `variant="strong"` usa a superfície escura (theme.surfaceStrong), pro
 * card "hero" de missões ativas se destacar dos demais.
 */
export function SurfaceCard({ onPress, variant = 'default', style, children, ...rest }: SurfaceCardProps) {
  const theme = useTheme();
  const backgroundColor = variant === 'strong' ? theme.surfaceStrong : theme.backgroundElement;
  const borderColor = variant === 'strong' ? theme.surfaceStrong : theme.border;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, { backgroundColor, borderColor }, pressed && styles.pressed, style]}
        {...rest}>
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor, borderColor }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.four,
  },
  pressed: {
    opacity: 0.9,
  },
});
