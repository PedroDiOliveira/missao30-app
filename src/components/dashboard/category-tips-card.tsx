import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';
import { getCategoryTip } from '@/lib/tips';
import type { UserMissionView } from '@/lib/types';

const CATEGORY_LABEL: Record<string, string> = {
  study: 'estudos',
  fitness: 'treino',
  sleep: 'sono',
  finance: 'finanças',
};

interface CategoryTipsCardProps {
  activeMissions: UserMissionView[];
}

/** Dica estática por categoria (src/lib/tips.ts) — some quando não há
 * nenhuma missão ativa em vez de mostrar algo genérico/decorativo
 * (CONTEXT.md Seção 2: "isso ajuda a métrica ou é decoração?"). */
export function CategoryTipsCard({ activeMissions }: CategoryTipsCardProps) {
  const theme = useTheme();
  const category = activeMissions[0]?.mission.category;
  const tip = useMemo(() => (category ? getCategoryTip(category) : null), [category]);

  if (!category || !tip) return null;

  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.header}>
        <UiIcons.tip size={18} color={theme.primary} />
        <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
          DICA DE {CATEGORY_LABEL[category].toUpperCase()}
        </ThemedText>
      </View>
      <ThemedText type="default">{tip}</ThemedText>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  eyebrow: {
    letterSpacing: 0.5,
  },
});
