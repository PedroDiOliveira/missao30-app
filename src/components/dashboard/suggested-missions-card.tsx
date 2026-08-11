import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORY_LABEL } from '@/lib/catalog';
import { CATALOG_ICONS, DEFAULT_CATALOG_ICON, UiIcons } from '@/lib/icons';
import { missionCatalog } from '@/lib/mock-data';
import type { UserMissionView } from '@/lib/types';

interface SuggestedMissionsCardProps {
  activeMissions: UserMissionView[];
}

/** Sugestões puxadas do catálogo, filtrando o que já está ativo. */
export function SuggestedMissionsCard({ activeMissions }: SuggestedMissionsCardProps) {
  const theme = useTheme();
  const activeMissionIds = new Set(activeMissions.map((m) => m.mission.id));
  const suggestions = missionCatalog.filter((m) => !activeMissionIds.has(m.id)).slice(0, 3);

  if (suggestions.length === 0) return null;

  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
          NOVOS DESAFIOS
        </ThemedText>
        <Pressable onPress={() => router.push('/missions')} accessibilityRole="button">
          <ThemedText type="small" themeColor="primary">
            Ver catálogo
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.list}>
        {suggestions.map((mission) => {
          const Icon = CATALOG_ICONS[mission.icon_name] ?? DEFAULT_CATALOG_ICON;
          return (
            <Pressable
              key={mission.id}
              onPress={() => router.push('/missions')}
              style={styles.item}
              accessibilityRole="button">
              <View style={[styles.iconBadge, { backgroundColor: theme.background }]}>
                <Icon size={16} color={theme.secondary} />
              </View>
              <View style={styles.itemText}>
                <ThemedText type="small" numberOfLines={1}>
                  {mission.title}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {CATEGORY_LABEL[mission.category]}
                </ThemedText>
              </View>
              <UiIcons.chevronRight size={16} color={theme.textSecondary} />
            </Pressable>
          );
        })}
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    letterSpacing: 0.5,
  },
  list: {
    gap: Spacing.three,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    gap: Spacing.half,
  },
});
