import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';

import { YearActivityGraph } from '@/components/dashboard/year-activity-graph';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { buildCalendarYearGrid, buildCheckInCountsByDate } from '@/lib/activity';
import { UiIcons } from '@/lib/icons';
import { computeQuickStats } from '@/lib/stats';
import type { UserMissionView } from '@/lib/types';

interface StreakBadgeProps {
  activeMissions: UserMissionView[];
  missionHistory: UserMissionView[];
}

const ANIMATION_DURATION = 220;
const MODAL_MARGIN = 16; // de cada lado — reduzido pra sobrar mais espaço pro gráfico
const CARD_MAX_WIDTH = 480; // teto pra telas grandes (tablet/web) não deixar o card gigante
const CARD_VERTICAL_PADDING = Spacing.five;
const GRAPH_PAGE_PADDING = 16;
const STREAK_PAGE_PADDING = Spacing.five;
const PAGE_COUNT = 2;

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
 *
 * Tocável: abre um modal com um carrossel de "moldes" pra compartilhar —
 * desliza pro lado pra ver os outros. O primeiro é o número da sequência
 * em destaque; o segundo é o gráfico de atividade do ano-calendário
 * inteiro (janeiro a dezembro, estilo GitHub, sem scroll — a largura do
 * card se ajusta à tela pra caber tudo de uma vez). O botão de compartilhar
 * fica fixo embaixo, fora do carrossel — a geração da imagem/story em si
 * ainda não existe, só o botão já está no lugar certo. */
export function StreakBadge({ activeMissions, missionHistory }: StreakBadgeProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { currentBestStreak } = computeQuickStats(activeMissions, missionHistory);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(0);

  const progress = useSharedValue(0);
  const currentYear = new Date().getFullYear();
  const weeks = buildCalendarYearGrid(buildCheckInCountsByDate(activeMissions, missionHistory), currentYear);

  const cardWidth = Math.min(windowWidth - MODAL_MARGIN * 2, CARD_MAX_WIDTH);
  const graphWidth = cardWidth - GRAPH_PAGE_PADDING * 2;

  function openModal() {
    setModalVisible(true);
    setPage(0);
    progress.value = withTiming(1, { duration: ANIMATION_DURATION });
  }

  function closeModal() {
    progress.value = withTiming(0, { duration: ANIMATION_DURATION * 0.8 }, (finished) => {
      if (finished) runOnJS(setModalVisible)(false);
    });
  }

  function handleShare() {
    Alert.alert('Em breve', 'Compartilhar como imagem/story é um recurso que ainda vamos construir.');
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    setPage(Math.max(0, Math.min(next, PAGE_COUNT - 1)));
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
              { width: cardWidth, backgroundColor: theme.backgroundElement, borderColor: theme.border },
              cardStyle,
            ]}>
            <Pressable
              onPress={closeModal}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Fechar">
              <UiIcons.close size={18} color={theme.textSecondary} />
            </Pressable>

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              onMomentumScrollEnd={handleScroll}
              scrollEventThrottle={16}
              style={[styles.pager, { width: cardWidth }]}>
              <View
                style={[
                  styles.page,
                  styles.streakPage,
                  { width: cardWidth, paddingHorizontal: STREAK_PAGE_PADDING },
                ]}>
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
              </View>

              <View style={[styles.page, { width: cardWidth, paddingHorizontal: GRAPH_PAGE_PADDING }]}>
                <View style={styles.pageHeader}>
                  <UiIcons.stats size={18} color={theme.primary} />
                  <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
                    SUA ATIVIDADE EM {currentYear}
                  </ThemedText>
                </View>
                <YearActivityGraph weeks={weeks} width={graphWidth} />
              </View>
            </ScrollView>

            <View style={styles.dots}>
              {Array.from({ length: PAGE_COUNT }, (_, i) => (
                <View
                  key={i}
                  style={[styles.dot, { backgroundColor: i === page ? theme.primary : theme.border }]}
                />
              ))}
            </View>

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
    paddingHorizontal: MODAL_MARGIN,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: CARD_VERTICAL_PADDING,
    alignItems: 'center',
    gap: Spacing.three,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    padding: Spacing.one,
    zIndex: 1,
  },
  pager: {
    flexGrow: 0,
  },
  page: {
    alignItems: 'center',
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
    marginBottom: Spacing.three,
  },
  eyebrow: {
    letterSpacing: 0.5,
  },
  streakPage: {
    gap: Spacing.one,
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
    lineHeight: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
    marginHorizontal: Spacing.four,
  },
});
