import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';
import { computeQuickStats } from '@/lib/stats';
import type { UserMissionView } from '@/lib/types';

interface StatsCardProps {
  activeMissions: UserMissionView[];
  missionHistory: UserMissionView[];
}

/** Mesmo seletor puro do card de estatísticas do dashboard
 * (`computeQuickStats`, src/lib/stats.ts), mas com um item a mais: taxa de
 * conclusão, que já era calculada mas não aparecia em nenhuma tela ainda.
 * Grade 2×2 em vez de 1 linha só, pra caber 4 itens sem espremer. */
export function StatsCard({ activeMissions, missionHistory }: StatsCardProps) {
  const theme = useTheme();
  const stats = computeQuickStats(activeMissions, missionHistory);
  const completionRateLabel =
    stats.completionRate === null ? '—' : `${Math.round(stats.completionRate * 100)}%`;

  const items = [
    { Icon: UiIcons.trophy, label: 'Missões\nconcluídas', value: String(stats.totalCompletedMissions) },
    { Icon: UiIcons.streak, label: 'Melhor\nsequência', value: String(stats.currentBestStreak) },
    { Icon: UiIcons.stats, label: 'Check-ins\nno total', value: String(stats.totalLifetimeCheckIns) },
    { Icon: UiIcons.percent, label: 'Taxa de\nconclusão', value: completionRateLabel },
  ];

  return (
    <SurfaceCard style={styles.card}>
      <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
        SUAS ESTATÍSTICAS
      </ThemedText>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={styles.stat}>
            <item.Icon size={18} color={theme.primary} />
            <ThemedText type="default" style={styles.value}>
              {item.value}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {item.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  eyebrow: {
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
  },
  stat: {
    width: '42%',
    flexGrow: 1,
    alignItems: 'flex-start',
    gap: Spacing.half,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
});
