import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { MissionStatusBadge } from '@/components/catalog/mission-status-badge';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORY_LABEL, getMissionAchievement } from '@/lib/catalog';
import { CATALOG_ICONS, DEFAULT_CATALOG_ICON } from '@/lib/icons';
import type { Mission, UserMissionView } from '@/lib/types';

const CARD_GAP = Spacing.three;
const SIDE_INSET = Spacing.four;
// Quanto do próximo card "espia" na borda — reforça a sensação de scroll
// contínuo (visual "Netflix") em vez de um paging estanque de tela cheia.
const PEEK = 28;

interface CatalogHeroCarouselProps {
  missions: Mission[];
  allUserMissions: UserMissionView[];
  onSelect: (missionId: string) => void;
}

/** Carrossel de destaque no topo do catálogo — mostra TODAS as missões
 * (CONTEXT.md Seção 8, Tela 2), sempre, sem filtro de categoria; o filtro
 * fica só na grade abaixo. */
export function CatalogHeroCarousel({ missions, allUserMissions, onSelect }: CatalogHeroCarouselProps) {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth, MaxContentWidth) - SIDE_INSET * 2 - PEEK;

  return (
    <ScrollView
      horizontal
      snapToInterval={cardWidth + CARD_GAP}
      decelerationRate="fast"
      snapToAlignment="start"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, { paddingHorizontal: SIDE_INSET }]}>
      {missions.map((mission) => {
        const achievement = getMissionAchievement(mission.id, allUserMissions);
        const Icon = CATALOG_ICONS[mission.icon_name] ?? DEFAULT_CATALOG_ICON;

        return (
          <Pressable
            key={mission.id}
            onPress={() => onSelect(mission.id)}
            style={({ pressed }) => [
              styles.card,
              { width: cardWidth, backgroundColor: theme.backgroundElement, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button">
            <View style={styles.headerRow}>
              <View style={[styles.iconBadge, { backgroundColor: theme.background }]}>
                <Icon size={26} color={theme.secondary} />
              </View>
              <MissionStatusBadge achievement={achievement} />
            </View>

            <ThemedText type="smallBold" numberOfLines={1}>
              {mission.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={2} style={styles.description}>
              {mission.description}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
              {CATEGORY_LABEL[mission.category]} · {mission.duration_days} dias · {mission.allowed_fails} faltas
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: CARD_GAP,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.9,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    lineHeight: 19,
  },
  meta: {
    marginTop: Spacing.one,
  },
});
