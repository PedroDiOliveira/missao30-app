import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';
import { computeQuickStats } from '@/lib/stats';
import type { UserMissionView } from '@/lib/types';

interface StreakBadgeProps {
  activeMissions: UserMissionView[];
  missionHistory: UserMissionView[];
}

const ANIMATION_DURATION = 220;

/** Mini anel de progresso — mesmo motivo do AppMark e do ícone de Missões,
 * de propósito: reforça a marca em vez de recorrer ao ícone de fogo que
 * praticamente todo app de streak usa (e que carrega uma conotação de
 * "não deixe apagar" meio oposta à filosofia de tolerância do produto). */
function StreakRingIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G transform="rotate(-90 12 12)">
        <Circle
          cx={12}
          cy={12}
          r={9}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray="42 14.1"
        />
      </G>
    </Svg>
  );
}

/** Badge de sequência no canto superior — usa a mesma definição de
 * "streak perdoador" já estabelecida (CONTEXT.md Decisão #2, calculada em
 * src/lib/stats.ts): a melhor sequência entre as missões ativas. Some
 * quando é 0, pra não virar decoração vazia pra quem ainda não começou.
 * Tocável: abre um card com o número em destaque + um botão de
 * compartilhar (a geração de imagem/story em si ainda não existe — o
 * botão já fica no lugar, só avisa que é uma feature futura). */
export function StreakBadge({ activeMissions, missionHistory }: StreakBadgeProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { currentBestStreak } = computeQuickStats(activeMissions, missionHistory);
  const [modalVisible, setModalVisible] = useState(false);

  const progress = useSharedValue(0);

  function openModal() {
    setModalVisible(true);
    progress.value = withTiming(1, { duration: ANIMATION_DURATION });
  }

  function closeModal() {
    progress.value = withTiming(0, { duration: ANIMATION_DURATION * 0.8 }, (finished) => {
      if (finished) runOnJS(setModalVisible)(false);
    });
  }

  function handleShare() {
    Alert.alert('Em breve', 'Compartilhar sua sequência como imagem é um recurso que ainda vamos construir.');
  }

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.85 + progress.value * 0.15 }, { translateY: (1 - progress.value) * -16 }],
  }));

  if (currentBestStreak === 0) return null;

  return (
    <>
      <Pressable
        onPress={openModal}
        style={({ pressed }) => [
          styles.badge,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          pressed && styles.badgePressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Sequência de ${currentBestStreak} dias. Toque para ver detalhes.`}>
        <StreakRingIcon color={theme.secondary} />
        <ThemedText type="smallBold">{currentBestStreak}</ThemedText>
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
        <Pressable
          style={[StyleSheet.absoluteFill, styles.backdropTouchable]}
          onPress={closeModal}
          accessibilityLabel="Fechar">
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />
        </Pressable>

        <View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFill, styles.modalWrap, { paddingTop: insets.top + Spacing.five }]}>
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              cardStyle,
            ]}>
            <Pressable
              onPress={closeModal}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Fechar">
              <UiIcons.close size={18} color={theme.textSecondary} />
            </Pressable>

            <View style={styles.iconBadge}>
              <StreakRingIcon color={theme.primary} size={32} />
            </View>

            <ThemedText type="title" style={styles.bigNumber}>
              {currentBestStreak}
            </ThemedText>
            <ThemedText type="smallBold" themeColor="secondary" style={styles.label}>
              {currentBestStreak === 1 ? 'DIA SEGUIDO DE CHECK-IN' : 'DIAS SEGUIDOS DE CHECK-IN'}
            </ThemedText>

            <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
              Esse número representa quantos dias seguidos você fez check-in nas suas missões, sem quebrar a
              sequência. Continue assim!
            </ThemedText>

            <Pressable
              onPress={handleShare}
              style={[styles.shareButton, { backgroundColor: theme.primary }]}
              accessibilityRole="button">
              <UiIcons.share size={16} color={theme.textOnDark} />
              <ThemedText type="smallBold" themeColor="textOnDark">
                Compartilhar
              </ThemedText>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  badgePressed: {
    opacity: 0.7,
  },
  backdropTouchable: {
    // vazio de propósito — só o fundo animado (Animated.View filho) pinta;
    // este Pressable existe pra capturar o toque de "fechar".
  },
  backdrop: {
    backgroundColor: 'rgba(22, 32, 31, 0.45)',
  },
  modalWrap: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.one,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    padding: Spacing.one,
  },
  iconBadge: {
    marginBottom: Spacing.two,
  },
  bigNumber: {
    fontSize: 56,
    lineHeight: 60,
  },
  label: {
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
    lineHeight: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    alignSelf: 'stretch',
  },
});
