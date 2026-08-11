import { Pressable, StyleSheet, View } from 'react-native';

import { MissionStatusBadge } from '@/components/catalog/mission-status-badge';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORY_LABEL, getCatalogStatus } from '@/lib/catalog';
import { CATALOG_ICONS, DEFAULT_CATALOG_ICON, UiIcons } from '@/lib/icons';
import type { Mission, UserMissionView } from '@/lib/types';

interface CatalogMissionRowProps {
  mission: Mission;
  allUserMissions: UserMissionView[];
  onPress: () => void;
}

/** Linha da grade filtrável abaixo do carrossel — mesma linguagem visual de
 * `active-mission-row.tsx`, mas em superfície clara e com selo de status no
 * lugar do botão de check-in inline (aqui o toque abre o modal de detalhe). */
export function CatalogMissionRow({ mission, allUserMissions, onPress }: CatalogMissionRowProps) {
  const theme = useTheme();
  const { status, latest } = getCatalogStatus(mission.id, allUserMissions);
  const Icon = CATALOG_ICONS[mission.icon_name] ?? DEFAULT_CATALOG_ICON;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button">
      <View style={[styles.iconBadge, { backgroundColor: theme.background }]}>
        <Icon size={20} color={theme.secondary} />
      </View>
      <View style={styles.textBlock}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {mission.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {CATEGORY_LABEL[mission.category]}
        </ThemedText>
        <MissionStatusBadge status={status} dayNumber={latest?.state.day_number} durationDays={mission.duration_days} />
      </View>
      <UiIcons.chevronRight size={18} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.8,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: Spacing.half,
  },
});
