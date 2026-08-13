import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { computeWeekBuckets } from '@/lib/mission-state';

interface WeeklyCadenceSummaryProps {
  startDate: string;
  durationDays: number;
  cadenceTarget: number;
  checkInDates: string[];
  today: string;
}

/**
 * Resumo por semana pra missões de cadência semanal — a grade de 30 dias
 * (`ProgressGrid`) é 5×6 por design visual (CONTEXT.md Seção 9), sem
 * relação com semanas dom-sáb reais que podem começar em qualquer dia da
 * semana; tentar mapear uma coisa na outra ficaria visualmente errado.
 * Reaproveita o mesmo `computeWeekBuckets()` que `computeMissionState()`
 * usa pra calcular faltas — fonte única, nada reimplementado aqui.
 */
export function WeeklyCadenceSummary({
  startDate,
  durationDays,
  cadenceTarget,
  checkInDates,
  today,
}: WeeklyCadenceSummaryProps) {
  const theme = useTheme();
  const buckets = computeWeekBuckets(startDate, durationDays, cadenceTarget, checkInDates, today);

  return (
    <View style={styles.list}>
      {buckets.map((bucket, index) => {
        const met = bucket.checkIns >= bucket.target;
        const label = !bucket.elapsed ? 'em andamento' : met ? '✓' : 'faltou';
        const color = !bucket.elapsed ? theme.textSecondary : met ? theme.success : theme.warning;
        return (
          <View key={bucket.weekStart} style={styles.row}>
            <ThemedText type="small" themeColor="textSecondary">
              Semana {index + 1}: {bucket.checkIns}/{bucket.target}
            </ThemedText>
            <ThemedText type="smallBold" style={{ color }}>
              {label}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.half,
  },
});
