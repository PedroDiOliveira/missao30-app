import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MissionDetailSkeleton } from '@/components/mission/mission-detail-skeleton';
import { ProgressGrid } from '@/components/mission/progress-grid';
import { WeeklyCadenceSummary } from '@/components/mission/weekly-cadence-summary';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BackButton } from '@/components/ui/back-button';
import { CheckRingIcon } from '@/components/ui/check-ring-icon';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StreakRingIcon } from '@/components/ui/streak-ring-icon';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Radius, Spacing } from '@/constants/theme';
import { useMissionsData } from '@/context/missions-context';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORY_LABEL } from '@/lib/catalog';
import { todayLocal } from '@/lib/date';

/**
 * Detalhe de uma missão — corpo quase idêntico ao antigo /home de missão
 * única, só que buscando pelo `id` no contexto compartilhado em vez de um
 * mock único. Dona da lógica de redirect por-missão (CONTEXT.md Seção 7):
 * id não encontrado → /home; encontrado mas não mais ativo → /report/[id];
 * encontrado e ativo → renderiza aqui.
 *
 * Barra superior com a marca do app (em vez de um ícone de voltar genérico)
 * — toque nela volta pro menu, mantendo a mesma linguagem de marca usada em
 * outros lugares do app (AppMark, StreakRingIcon) em vez de recorrer a um
 * componente de navegação padrão sem personalidade.
 */
export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { getMissionById, checkIn, abandonMission, loading } = useMissionsData();
  const [confirmingAbandon, setConfirmingAbandon] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const mission = getMissionById(id);

  if (loading) return <MissionDetailSkeleton />;
  if (!mission) {
    return <Redirect href="/home" />;
  }
  if (mission.state.status !== 'active') {
    return <Redirect href={`/report/${mission.userMission.id}`} />;
  }

  const { userMission, mission: missionInfo, state, checkInDates } = mission;
  const today = todayLocal();
  const alreadyCheckedInToday = checkInDates.includes(today);
  const livesRemaining = userMission.allowed_fails - state.fails_count;

  async function handleCheckIn() {
    if (alreadyCheckedInToday) return;
    try {
      await checkIn(userMission.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setActionError('Não foi possível registrar o check-in agora. Verifique sua conexão e tente de novo.');
    }
  }

  async function confirmAbandon() {
    try {
      await abandonMission(userMission.id);
      router.push(`/report/${userMission.id}`);
    } catch {
      setActionError('Não foi possível abandonar a missão agora. Tente de novo em instantes.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <BackButton />

          <View style={styles.header}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.category}>
              {CATEGORY_LABEL[missionInfo.category].toUpperCase()}
            </ThemedText>
            <ThemedText type="title" style={styles.missionTitle}>
              {missionInfo.title}
            </ThemedText>
            <ThemedText type="subtitle" themeColor="textSecondary">
              Dia {state.day_number} de {userMission.duration_days}
            </ThemedText>
          </View>

          <SurfaceCard style={styles.progressCard}>
            <View style={styles.livesRow}>
              <View style={styles.livesDots}>
                {Array.from({ length: userMission.allowed_fails }, (_, i) => i + 1).map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.lifeDot,
                      { backgroundColor: i <= livesRemaining ? theme.success : theme.warning },
                    ]}
                  />
                ))}
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {livesRemaining} de {userMission.allowed_fails} faltas disponíveis
              </ThemedText>
            </View>

            <ProgressGrid
              durationDays={userMission.duration_days}
              dayNumber={state.day_number}
              startDate={userMission.start_date}
              checkInDates={checkInDates}
              isActive
              cadenceUnit={userMission.cadence_unit}
            />

            {userMission.cadence_unit === 'week' && (
              <WeeklyCadenceSummary
                startDate={userMission.start_date}
                durationDays={userMission.duration_days}
                cadenceTarget={userMission.cadence_target}
                checkInDates={checkInDates}
                today={today}
              />
            )}

            <View style={styles.streakRow}>
              <StreakRingIcon color={theme.secondary} size={16} />
              <ThemedText type="smallBold">Sequência: {checkInDates.length} check-ins</ThemedText>
            </View>
          </SurfaceCard>

          <Pressable
            accessibilityRole="button"
            onPress={handleCheckIn}
            disabled={alreadyCheckedInToday}
            accessibilityLabel={alreadyCheckedInToday ? 'Check-in já feito hoje' : 'Fazer check-in do dia'}
            style={({ pressed }) => [
              styles.checkInButton,
              { backgroundColor: alreadyCheckedInToday ? theme.backgroundElement : theme.primary },
              pressed && !alreadyCheckedInToday && styles.checkInButtonPressed,
            ]}>
            <CheckRingIcon
              done={alreadyCheckedInToday}
              color={alreadyCheckedInToday ? theme.secondary : theme.textOnDark}
              size={22}
            />
            <ThemedText type="smallBold" themeColor={alreadyCheckedInToday ? 'secondary' : 'textOnDark'}>
              Check-in do Dia
            </ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setConfirmingAbandon(true)}
            style={styles.abandonLink}>
            <ThemedText type="small" themeColor="textSecondary">
              Abandonar Missão
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <ConfirmDialog
        visible={confirmingAbandon}
        onClose={() => setConfirmingAbandon(false)}
        title="Abandonar missão?"
        message="Isso não pode ser desfeito. Você vai poder aceitar uma missão nova imediatamente."
        confirmLabel="Abandonar"
        onConfirm={confirmAbandon}
      />

      <ConfirmDialog
        visible={actionError !== null}
        onClose={() => setActionError(null)}
        title="Ops"
        message={actionError ?? ''}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.one,
  },
  category: {
    letterSpacing: 1,
  },
  missionTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  progressCard: {
    gap: Spacing.four,
  },
  livesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  livesDots: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  lifeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  checkInButton: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  checkInButtonPressed: {
    opacity: 0.85,
  },
  abandonLink: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
