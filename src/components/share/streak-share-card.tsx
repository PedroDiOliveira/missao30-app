import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewShotRef } from 'react-native-view-shot';

import { ShareCardFrame } from '@/components/share/share-card-frame';
import { ThemedText } from '@/components/themed-text';
import { StreakRingIcon } from '@/components/ui/streak-ring-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface StreakShareCardProps {
  width: number;
  streakDays: number;
}

/**
 * Card de compartilhamento da página "sequência" do modal do `StreakBadge`
 * — mesmo número/ícone já mostrados ali, só em escala de card 9:16 pra
 * exportar. O label é de propósito DIFERENTE do texto usado dentro do
 * modal ("DIAS SEGUIDOS DE CHECK-IN") — "check-in" é vocabulário que só
 * faz sentido pra quem já usa o app; quem recebe o card compartilhado
 * (Stories, WhatsApp) não tem esse contexto, então aqui descreve o que a
 * sequência representa, não o mecanismo interno do app.
 *
 * Encaminha o ref até o `ViewShot` dentro de `ShareCardFrame` — é isso que
 * `share-capture.ts` captura.
 */
export const StreakShareCard = forwardRef<ViewShotRef, StreakShareCardProps>(function StreakShareCard(
  { width, streakDays },
  ref,
) {
  const theme = useTheme();

  return (
    <ShareCardFrame ref={ref} width={width}>
      <View style={styles.iconBadge}>
        <StreakRingIcon color={theme.primary} size={40} />
      </View>
      <ThemedText type="title" themeColor="textOnDark" style={styles.bigNumber}>
        {streakDays}
      </ThemedText>
      <ThemedText type="smallBold" themeColor="textOnDark" style={styles.label}>
        {streakDays === 1 ? 'DIA SEGUIDO CONSTRUINDO BONS HÁBITOS' : 'DIAS SEGUIDOS CONSTRUINDO BONS HÁBITOS'}
      </ThemedText>
    </ShareCardFrame>
  );
});

const styles = StyleSheet.create({
  iconBadge: {
    marginBottom: Spacing.two,
  },
  bigNumber: {
    fontSize: 88,
    lineHeight: 92,
  },
  label: {
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
