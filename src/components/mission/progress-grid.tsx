import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
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

const CELL_COLOR: Record<DayCellState, string> = {
  completed: Colors.dark.success,
  missed: Colors.dark.warning,
  current: Colors.dark.current,
  future: Colors.dark.locked,
};

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export function ProgressGrid({ durationDays, dayNumber, startDate, checkInDates, isActive }: ProgressGridProps) {
  const checkInSet = new Set(checkInDates);
  const days = Array.from({ length: durationDays }, (_, i) => i + 1);
  const rows = chunk(days, COLUMNS);

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((day) => {
            const date = addDaysLocal(startDate, day - 1);
            const state = cellState(day, dayNumber, isActive, checkInSet.has(date));
            return (
              <View key={day} style={[styles.cell, { backgroundColor: CELL_COLOR[state] }]}>
                <ThemedText
                  type="smallBold"
                  style={[styles.cellText, state === 'future' && styles.cellTextFuture]}>
                  {day}
                </ThemedText>
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
    color: Colors.dark.text,
    fontSize: 12,
  },
  cellTextFuture: {
    color: Colors.dark.textSecondary,
  },
});
