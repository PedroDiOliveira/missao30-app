import { cloneElement, useState, type ReactElement } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { ViewShotRef } from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { Radius, Spacing } from '@/constants/theme';
import { SHARE_CARD_EXPORT_HEIGHT, SHARE_CARD_EXPORT_WIDTH } from '@/constants/share';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';
import { captureCardAsFile, shareCardFile, SharingUnavailableError } from '@/lib/share-capture';

const MODAL_MARGIN = 16; // mesmo valor de AnimatedModal (não exportado de lá)
const CARD_PADDING = Spacing.five; // idem — padding interno do card de AnimatedModal
const BUTTON_HEIGHT = 56;
const CHROME_ALLOWANCE = Spacing.five * 2 + CARD_PADDING * 2 + BUTTON_HEIGHT + Spacing.three;

interface SharePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  /** Ref já criado por quem chama (é também quem decide qual card renderizar
   * em `children`) — este modal só usa pra capturar na hora de compartilhar. */
  cardRef: React.RefObject<ViewShotRef | null>;
  /** O card a mostrar, ex.: `<StreakShareCard ref={cardRef} streakDays={n} />`
   * — sem a prop `width`: este modal calcula o tamanho disponível e injeta
   * ela sozinho (`cloneElement`), pra não duplicar essa conta em cada tela
   * que abre o modal. */
  children: ReactElement<{ width: number }>;
}

/**
 * Prévia em tela cheia antes de compartilhar (CONTEXT.md, novo item do Log
 * de Decisões) — mesmo padrão que Duolingo/Strava/GitHub usam pra esse tipo
 * de card: mostrar exatamente o que vai sair antes de disparar a bandeja
 * nativa. Reaproveita `AnimatedModal` em vez de duplicar a coreografia de
 * backdrop/animação que `streak-badge.tsx` já tem.
 *
 * Só "Compartilhar" nesta rodada — "Salvar na Galeria" depende de
 * `expo-media-library` + permissão configurada, que é o passo seguinte do
 * plano (só depois do checkpoint de captura confirmado no aparelho).
 */
export function SharePreviewModal({ visible, onClose, cardRef, children }: SharePreviewModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxCardHeight = windowHeight - insets.top - insets.bottom - CHROME_ALLOWANCE;
  const widthFromHeight = maxCardHeight * (SHARE_CARD_EXPORT_WIDTH / SHARE_CARD_EXPORT_HEIGHT);
  const previewWidth = Math.min(windowWidth - MODAL_MARGIN * 2 - CARD_PADDING * 2, widthFromHeight);
  const outerWidth = previewWidth + CARD_PADDING * 2;

  async function handleShare() {
    setError(null);
    setSharing(true);
    try {
      const fileUri = await captureCardAsFile(cardRef);
      await shareCardFile(fileUri);
    } catch (err) {
      console.error('Falha ao compartilhar card:', err);
      if (err instanceof SharingUnavailableError) {
        // Não é falha transitória (tentar de novo nunca resolve nesse
        // navegador) — mensagem diferente de propósito.
        setError('Esse navegador não tem compartilhamento nativo disponível. Funciona no app instalado no celular.');
      } else {
        setError('Não foi possível gerar a imagem agora. Tente de novo em instantes.');
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <AnimatedModal visible={visible} onClose={onClose} cardStyle={{ width: outerWidth }}>
      <View style={styles.cardWrap}>{cloneElement(children, { width: previewWidth })}</View>

      {error && (
        <ThemedText type="small" themeColor="warning" style={styles.error}>
          {error}
        </ThemedText>
      )}

      <Pressable
        onPress={handleShare}
        disabled={sharing}
        style={[styles.shareButton, { backgroundColor: theme.primary, opacity: sharing ? 0.7 : 1 }]}
        accessibilityRole="button">
        {sharing ? (
          <ActivityIndicator color={theme.textOnDark} />
        ) : (
          <>
            <UiIcons.share size={16} color={theme.textOnDark} />
            <ThemedText type="smallBold" themeColor="textOnDark">
              Compartilhar
            </ThemedText>
          </>
        )}
      </Pressable>
    </AnimatedModal>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    alignItems: 'center',
  },
  error: {
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: BUTTON_HEIGHT,
    borderRadius: Radius.md,
  },
});
