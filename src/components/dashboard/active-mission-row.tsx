import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CheckRingIcon } from '@/components/ui/check-ring-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { todayLocal } from '@/lib/date';
import { CATALOG_ICONS, DEFAULT_CATALOG_ICON } from '@/lib/icons';
import type { UserMissionView } from '@/lib/types';

const CATEGORY_LABEL: Record<string, string> = {
  study: 'Estudos',
  fitness: 'Treino',
  sleep: 'Sono',
  finance: 'Finanças',
};

interface ActiveMissionRowProps {
  view: UserMissionView;
  onCheckIn: (userMissionId: string) => void;
}

/** Uma linha por missão ativa no card hero do dashboard: título + categoria
 * + indicador compacto de progresso (não a grade completa — fica no
 * detalhe) + botão de check-in que age direto aqui, sem navegar. */
export function ActiveMissionRow({ view, onCheckIn }: ActiveMissionRowProps) {
  const theme = useTheme();
  const { userMission, mission, state, checkInDates } = view;
  const alreadyCheckedInToday = checkInDates.includes(todayLocal());
  const Icon = CATALOG_ICONS[mission.icon_name] ?? DEFAULT_CATALOG_ICON;
  const progress = Math.min(state.day_number / userMission.duration_days, 1);

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.info}
        onPress={() => router.push(`/mission/${userMission.id}`)}
        accessibilityRole="button">
        <View style={[styles.iconBadge, { backgroundColor: theme.background }]}>
          <Icon size={18} color={theme.secondary} />
        </View>
        <View style={styles.textBlock}>
          <ThemedText type="smallBold" themeColor="textOnDark" numberOfLines={1}>
            {mission.title}
          </ThemedText>
          <ThemedText type="small" themeColor="textOnDarkSecondary">
            {CATEGORY_LABEL[mission.category]} · Dia {state.day_number}/{userMission.duration_days}
          </ThemedText>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={() => onCheckIn(userMission.id)}
        disabled={alreadyCheckedInToday}
        style={({ pressed }) => [
          styles.checkInButton,
          { backgroundColor: alreadyCheckedInToday ? theme.background : theme.primary },
          pressed && !alreadyCheckedInToday && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={alreadyCheckedInToday ? 'Check-in já feito hoje' : 'Fazer check-in'}>
        <CheckRingIcon
          done={alreadyCheckedInToday}
          color={alreadyCheckedInToday ? theme.secondary : theme.textOnDark}
          size={20}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: Spacing.half,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(242, 233, 220, 0.25)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  checkInButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
