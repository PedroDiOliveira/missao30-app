import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DayCell } from '@/lib/activity';

const CELL_SIZE = 10;
const CELL_GAP = 3;
const COLUMN_WIDTH = CELL_SIZE + CELL_GAP;
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface YearActivityGraphProps {
  weeks: DayCell[][];
}

function monthOf(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00`).getMonth();
}

/**
 * Gráfico de atividade anual estilo GitHub: 53 colunas (semanas) × 7 linhas
 * (dias), cada quadrado é um dia, mais escuro quanto mais check-ins teve.
 * Legenda: só os nomes dos meses, posicionados por baixo da coluna onde
 * cada mês começa — sem eixo de dia da semana nem contagem por célula.
 */
export function YearActivityGraph({ weeks }: YearActivityGraphProps) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const gridWidth = weeks.length * COLUMN_WIDTH;

  useEffect(() => {
    // Abre já mostrando os meses mais recentes, como o GitHub faz.
    const id = requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: false }));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ width: gridWidth }}>
        <View style={styles.grid}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.column}>
              {week.map((day) => (
                <View
                  key={day.date}
                  style={[
                    styles.cell,
                    day.isFuture
                      ? styles.cellFuture
                      : {
                          backgroundColor: day.count > 0 ? theme.success : theme.locked,
                          opacity: day.count > 0 ? Math.min(0.5 + day.count * 0.2, 1) : 1,
                        },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={[styles.monthRow, { width: gridWidth }]}>
          {weeks.map((week, weekIndex) => {
            if (weekIndex === 0) return null;
            const firstRealDay = week.find((d) => !d.isFuture);
            if (!firstRealDay) return null;
            const prevWeek = weeks[weekIndex - 1];
            const prevFirstRealDay = prevWeek.find((d) => !d.isFuture) ?? prevWeek[0];
            if (monthOf(firstRealDay.date) === monthOf(prevFirstRealDay.date)) return null;

            return (
              <ThemedText
                key={weekIndex}
                type="small"
                themeColor="textSecondary"
                style={[styles.monthLabel, { left: weekIndex * COLUMN_WIDTH }]}>
                {MONTH_LABELS[monthOf(firstRealDay.date)]}
              </ThemedText>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  column: {
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
  cellFuture: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  monthRow: {
    height: 16,
    marginTop: Spacing.one,
  },
  monthLabel: {
    position: 'absolute',
    top: 0,
    fontSize: 10,
  },
});
