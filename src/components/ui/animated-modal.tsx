import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';

const ANIMATION_DURATION = 220;
const MODAL_MARGIN = 16;
const CARD_MAX_WIDTH = 480;

interface AnimatedModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
}

/**
 * Primitivo de modal reutilizável — extrai a coreografia já usada em
 * `streak-badge.tsx` (backdrop com fade, card com scale+translate na
 * entrada, fechar ao tocar no backdrop ou no X) pra não duplicar essa
 * animação nos modais novos do catálogo. `streak-badge.tsx` continua com a
 * própria implementação (já verificada, não vale a pena arriscar mexer nela
 * só por DRY); este componente serve só o código novo.
 */
export function AnimatedModal({ visible, onClose, children, cardStyle }: AnimatedModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const progress = useSharedValue(visible ? 1 : 0);
  const [mounted, setMounted] = useState(visible);

  // Deriva `mounted` durante o render (não num efeito — evitar
  // react-hooks/set-state-in-effect): assim que `visible` fica true, o
  // Modal precisa estar montado já neste mesmo render, antes da animação de
  // entrada começar.
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setMounted(true);
  }

  // Disparar a animação em si é legitimamente um efeito (sincroniza com o
  // shared value do Reanimated, não é um setState do React).
  //
  // Desmontar usa um setTimeout, não o callback de conclusão do
  // `withTiming` — de propósito. Esse callback só reporta `finished: true`
  // se NADA reatribuir `progress.value` antes da animação acabar; abrir de
  // novo rápido logo depois de fechar (ex.: trocar de missão no catálogo)
  // interrompe a animação de saída em andamento, o callback nunca chama
  // `finished: true`, e sem essa troca pra setTimeout o modal ficava
  // montado pra sempre — invisível (opacidade 0), mas o `Pressable` de
  // tela cheia continuava lá bloqueando qualquer toque na tela por trás.
  // O cleanup do efeito (`clearTimeout`) já cancela esse timer sozinho se
  // `visible` mudar de novo antes dele disparar — mesma garantia que se
  // queria do `finished`, só que não depende de nenhuma promessa entre
  // threads do Reanimated.
  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, { duration: ANIMATION_DURATION });
      return;
    }
    progress.value = withTiming(0, { duration: ANIMATION_DURATION * 0.8 });
    const timer = setTimeout(() => setMounted(false), ANIMATION_DURATION * 0.8);
    return () => clearTimeout(timer);
  }, [visible, progress]);

  const cardWidth = Math.min(windowWidth - MODAL_MARGIN * 2, CARD_MAX_WIDTH);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.85 + progress.value * 0.15 }, { translateY: (1 - progress.value) * -16 }],
  }));

  if (!mounted) return null;

  // `pointerEvents` desligado assim que `visible` vira false — síncrono
  // com a prop, não espera a animação nem o unmount. Defesa independente
  // da lógica de desmontar acima: mesmo que o modal ainda esteja na tela
  // terminando de desaparecer (`mounted` ainda true), ele já para de
  // aceitar toque na mesma hora. Existe especificamente pra evitar remover
  // da árvore um elemento que acabou de ser tocado enquanto o navegador
  // ainda está processando aquele toque — gatilho conhecido do erro
  // "Cannot find single active touch" do sistema de toque do
  // react-native-web (o unmount atrasado por si só não é o bug; tocar de
  // novo bem em cima do fechamento é).
  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        pointerEvents={visible ? 'auto' : 'none'}
        accessibilityLabel="Fechar">
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />
      </Pressable>

      <View
        pointerEvents={visible ? 'box-none' : 'none'}
        style={[StyleSheet.absoluteFill, styles.modalWrap, { paddingTop: insets.top + Spacing.five }]}>
        <Animated.View
          style={[
            styles.card,
            { width: cardWidth, backgroundColor: theme.backgroundElement, borderColor: theme.border },
            cardStyle,
            cardAnimatedStyle,
          ]}>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Fechar">
            <UiIcons.close size={18} color={theme.textSecondary} />
          </Pressable>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(22, 32, 31, 0.45)',
  },
  modalWrap: {
    alignItems: 'center',
    paddingHorizontal: MODAL_MARGIN,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.five,
    gap: Spacing.three,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    padding: Spacing.one,
    zIndex: 1,
  },
});
