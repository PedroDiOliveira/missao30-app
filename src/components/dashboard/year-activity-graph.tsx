import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DayCell } from '@/lib/activity';

const GAP = 2;
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface YearActivityGraphProps {
  weeks: DayCell[][];
  /** Largura disponível pro grid inteiro caber sem precisar de scroll. */
  width: number;
}

function monthOf(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00`).getMonth();
}

/**
 * Gráfico de atividade anual estilo GitHub: uma coluna por semana, 7 linhas
 * (dias), cada quadrado mais escuro quanto mais check-ins teve. O tamanho
 * da célula é calculado a partir de `width` pra o ano inteiro (janeiro a
 * dezembro, ~53 colunas) caber de uma vez, sem cortar meses.
 * Legenda: só os nomes dos meses, por baixo da coluna onde cada um começa.
 */
export function YearActivityGraph({ weeks, width }: YearActivityGraphProps) {
  const theme = useTheme();
  const columns = weeks.length;
  const cellSize = Math.max((width - (columns - 1) * GAP) / columns, 3);
  const columnWidth = cellSize + GAP;
  const gridWidth = columns * columnWidth - GAP;

  return (
    <View style={{ width: gridWidth }}>
      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={{ gap: GAP }}>
            {week.map((day) => (
              <View
                key={day.date}
                style={[
                  { width: cellSize, height: cellSize, borderRadius: Math.min(cellSize / 4, 2) },
                  day.inYear
                    ? {
                        backgroundColor: day.count > 0 ? theme.success : theme.locked,
                        opacity: day.count > 0 ? Math.min(0.5 + day.count * 0.2, 1) : 1,
                      }
                    : styles.cellOutOfYear,
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={[styles.monthRow, { width: gridWidth }]}>
        {weeks.map((week, weekIndex) => {
          const firstRealDay = week.find((d) => d.inYear);
          if (!firstRealDay) return null;

          // Semana 0 é sempre a primeira semana de janeiro — não tem
          // semana anterior pra comparar, então o rótulo sempre aparece
          // (diferente das demais, que só aparecem quando o mês muda).
          if (weekIndex > 0) {
            const prevWeek = weeks[weekIndex - 1];
            const prevFirstRealDay = prevWeek.find((d) => d.inYear) ?? prevWeek[0];
            if (monthOf(firstRealDay.date) === monthOf(prevFirstRealDay.date)) return null;
          }

          return (
            <ThemedText
              key={weekIndex}
              type="small"
              themeColor="textSecondary"
              style={[styles.monthLabel, { left: weekIndex * columnWidth }]}>
              {MONTH_LABELS[monthOf(firstRealDay.date)]}
            </ThemedText>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: GAP,
  },
  cellOutOfYear: {
    backgroundColor: 'transparent',
  },
  monthRow: {
    height: 16,
    marginTop: Spacing.one,
  },
  monthLabel: {
    position: 'absolute',
    top: 0,
    fontSize: 9,
  },
});
