import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';
import { getQuoteOfTheDay } from '@/lib/quotes';

/**
 * Frase do dia — citação real com autor (src/lib/quotes.ts), trocada uma
 * vez por dia, não a cada render. Ao contrário da antiga dica por
 * categoria, não depende de ter missão ativa: é o primeiro card do
 * dashboard, um "bom dia" leve antes do conteúdo funcional.
 */
export function QuoteOfTheDayCard() {
  const theme = useTheme();
  const quote = getQuoteOfTheDay();

  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.header}>
        <UiIcons.quote size={18} color={theme.primary} />
        <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
          FRASE DO DIA
        </ThemedText>
      </View>
      <ThemedText type="default" style={styles.quoteText}>
        {`“${quote.text}”`}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        — {quote.author}
      </ThemedText>
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
  quoteText: {
    fontStyle: 'italic',
  },
});
