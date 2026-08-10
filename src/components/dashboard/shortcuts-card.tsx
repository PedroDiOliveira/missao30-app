import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';

const SHORTCUTS = [
  { key: 'profile', label: 'Perfil', href: '/profile' as const, Icon: UiIcons.profile },
  { key: 'catalog', label: 'Catálogo completo', href: '/missions' as const, Icon: UiIcons.catalog },
];

export function ShortcutsCard() {
  const theme = useTheme();
  return (
    <SurfaceCard style={styles.card}>
      {SHORTCUTS.map((shortcut) => (
        <Pressable
          key={shortcut.key}
          onPress={() => router.push(shortcut.href)}
          style={styles.item}
          accessibilityRole="button">
          <shortcut.Icon size={18} color={theme.secondary} />
          <ThemedText type="default" style={styles.label}>
            {shortcut.label}
          </ThemedText>
          <UiIcons.chevronRight size={16} color={theme.textSecondary} />
        </Pressable>
      ))}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    flex: 1,
  },
});
