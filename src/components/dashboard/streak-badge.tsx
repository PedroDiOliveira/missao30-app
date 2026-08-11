import Svg, { Circle, G } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { computeQuickStats } from '@/lib/stats';
import type { UserMissionView } from '@/lib/types';

interface StreakBadgeProps {
  activeMissions: UserMissionView[];
  missionHistory: UserMissionView[];
}

/** Mini anel de progresso — mesmo motivo do AppMark e do ícone de Missões,
 * de propósito: reforça a marca em vez de recorrer ao ícone de fogo que
 * praticamente todo app de streak usa (e que carrega uma conotação de
 * "não deixe apagar" meio oposta à filosofia de tolerância do produto). */
function StreakRingIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G transform="rotate(-90 12 12)">
        <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="42 14.1" />
      </G>
    </Svg>
  );
}

/** Badge de sequência no canto superior — usa a mesma definição de
 * "streak perdoador" já estabelecida (CONTEXT.md Decisão #2, calculada em
 * src/lib/stats.ts): a melhor sequência entre as missões ativas. Some
 * quando é 0, pra não virar decoração vazia pra quem ainda não começou. */
export function StreakBadge({ activeMissions, missionHistory }: StreakBadgeProps) {
  const theme = useTheme();
  const { currentBestStreak } = computeQuickStats(activeMissions, missionHistory);

  if (currentBestStreak === 0) return null;

  return (
    <View style={[styles.badge, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <StreakRingIcon color={theme.secondary} />
      <ThemedText type="smallBold">{currentBestStreak}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
});
