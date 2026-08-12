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

/** Card de compartilhamento da página "sequência" do modal do `StreakBadge`
 * — mesmo número/ícone/label já mostrados ali, só em escala de card 9:16
 * pra exportar. Encaminha o ref até o `ViewShot` dentro de `ShareCardFrame`
 * — é isso que `share-capture.ts` captura. */
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
        {streakDays === 1 ? 'DIA SEGUIDO DE CHECK-IN' : 'DIAS SEGUIDOS DE CHECK-IN'}
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
