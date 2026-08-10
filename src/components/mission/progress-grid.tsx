import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DayCellState } from '@/lib/types';

interface ProgressGridProps {
  durationDays: number;
  dayNumber: number;
  startDate: string; // YYYY-MM-DD
  checkInDates: string[]; // YYYY-MM-DD[]
  isActive: boolean;
}

const COLUMNS = 6;

function addDaysLocal(base: string, n: number): string {
  const d = new Date(`${base}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
}

// Mesma derivação da grade especificada no CONTEXT.md, Seção 7.
function cellState(day: number, dayNumber: number, isActive: boolean, hasCheckIn: boolean): DayCellState {
  if (hasCheckIn) return 'completed';
  if (day < dayNumber) return 'missed';
  if (day === dayNumber && isActive) return 'current';
  return 'future';
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export function ProgressGrid({ durationDays, dayNumber, startDate, checkInDates, isActive }: ProgressGridProps) {
  const theme = useTheme();
  const checkInSet = new Set(checkInDates);
  const days = Array.from({ length: durationDays }, (_, i) => i + 1);
  const rows = chunk(days, COLUMNS);

  // Cor de fundo e de texto por estado — contraste varia por tom, não dá
  // pra usar um texto único pra todas as células como no tema escuro antigo.
  const cellAppearance: Record<DayCellState, { background: string; text: string }> = {
    completed: { background: theme.success, text: theme.textOnDark },
    missed: { background: theme.warning, text: theme.text },
    current: { background: theme.current, text: theme.textOnDark },
    future: { background: theme.locked, text: theme.textSecondary },
  };

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((day) => {
            const date = addDaysLocal(startDate, day - 1);
            const state = cellState(day, dayNumber, isActive, checkInSet.has(date));
            const appearance = cellAppearance[state];
            return (
              <View key={day} style={[styles.cell, { backgroundColor: appearance.background }]}>
                <Text style={[styles.cellText, { color: appearance.text }]}>{day}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
