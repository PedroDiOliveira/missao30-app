import { forwardRef, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';

import { ThemedText } from '@/components/themed-text';
import { AppMark } from '@/components/ui/app-mark';
import { Radius, Spacing } from '@/constants/theme';
import {
  SHARE_CARD_EXPORT_HEIGHT,
  SHARE_CARD_EXPORT_WIDTH,
  SHARE_SAFE_MARGIN_BOTTOM_RATIO,
  SHARE_SAFE_MARGIN_SIDE_RATIO,
  SHARE_SAFE_MARGIN_TOP_RATIO,
} from '@/constants/share';
import { useTheme } from '@/hooks/use-theme';

interface ShareCardFrameProps {
  /** Largura de exibição em tela — a proporção 9:16 (Stories) é sempre
   * mantida, a altura é derivada daqui. */
  width: number;
  children: ReactNode;
}

/**
 * Moldura 9:16 compartilhada pelos cards de compartilhamento (streak/ano) —
 * fundo no mesmo verde-petróleo "hero" já usado em outros cards do app,
 * marca d'água discreta fixa no rodapé, e um respiro interno seguindo as
 * margens de segurança de `constants/share.ts` (topo/base assimétricos —
 * base maior por causa da barra de ações do TikTok). A raiz é o próprio
 * componente `ViewShot` (não uma `View` comum) — ele cuida de marcar
 * `collapsable={false}` sozinho (sem isso, o Fabric pode "achatar" a view
 * da árvore nativa e sumir da captura) e de esperar o primeiro layout antes
 * de permitir capturar, evitando imagem em branco por captura prematura.
 */
export const ShareCardFrame = forwardRef<ViewShotRef, ShareCardFrameProps>(function ShareCardFrame(
  { width, children },
  ref,
) {
  const theme = useTheme();
  const height = width * (SHARE_CARD_EXPORT_HEIGHT / SHARE_CARD_EXPORT_WIDTH);

  return (
    <ViewShot ref={ref} style={[styles.frame, { width, height, backgroundColor: theme.surfaceStrong }]}>
      <View
        style={[
          styles.safeArea,
          {
            paddingTop: height * SHARE_SAFE_MARGIN_TOP_RATIO,
            paddingBottom: height * SHARE_SAFE_MARGIN_BOTTOM_RATIO,
            paddingHorizontal: width * SHARE_SAFE_MARGIN_SIDE_RATIO,
          },
        ]}>
        {children}
      </View>

      <View style={styles.watermark} pointerEvents="none">
        <AppMark size={20} onDark />
        <ThemedText type="smallBold" themeColor="textOnDark">
          Missão30
        </ThemedText>
      </View>
    </ViewShot>
  );
});

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderRadius: Radius.lg,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  watermark: {
    position: 'absolute',
    bottom: Spacing.four,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
