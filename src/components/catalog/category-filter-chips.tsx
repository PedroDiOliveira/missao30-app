import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORY_LABEL } from '@/lib/catalog';
import type { MissionCategory } from '@/lib/types';

export type CategoryFilter = 'all' | MissionCategory;

const CATEGORIES: CategoryFilter[] = ['all', 'study', 'fitness', 'sleep', 'finance'];

interface CategoryFilterChipsProps {
  selected: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
}

/** Pills de filtro por categoria abaixo do carrossel — controla a grade
 * vertical (CONTEXT.md Seção 8, Tela 2). */
export function CategoryFilterChips({ selected, onSelect }: CategoryFilterChipsProps) {
  const theme = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {CATEGORIES.map((category) => {
        const active = category === selected;
        const label = category === 'all' ? 'Todas' : CATEGORY_LABEL[category];

        return (
          <Pressable
            key={category}
            onPress={() => onSelect(category)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.secondary : theme.backgroundElement,
                borderColor: active ? theme.secondary : theme.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}>
            <ThemedText type="smallBold" themeColor={active ? 'textOnDark' : 'textSecondary'}>
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
});
