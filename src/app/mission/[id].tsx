import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressGrid } from '@/components/mission/progress-grid';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CheckRingIcon } from '@/components/ui/check-ring-icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useMissionsData } from '@/context/missions-context';
import { todayLocal } from '@/lib/date';
import type { MissionCategory } from '@/lib/types';

const CATEGORY_LABEL: Record<MissionCategory, string> = {
  study: 'Estudos',
  fitness: 'Treino',
  sleep: 'Sono',
  finance: 'Finanças',
};

/**
 * Detalhe de uma missão — corpo quase idêntico ao antigo /home de missão
 * única, só que buscando pelo `id` no contexto compartilhado em vez de um
 * mock único. Dona da lógica de redirect por-missão (CONTEXT.md Seção 7):
 * id não encontrado → /home; encontrado mas não mais ativo → /report/[id];
 * encontrado e ativo → renderiza aqui.
 */
export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMissionById, checkIn, abandonMission } = useMissionsData();
  const mission = getMissionById(id);

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

  function handleCheckIn() {
    if (alreadyCheckedInToday) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    checkIn(userMission.id);
  }

  function handleAbandon() {
    Alert.alert(
      'Abandonar missão?',
      'Isso não pode ser desfeito. Você vai poder aceitar uma missão nova imediatamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abandonar',
          style: 'destructive',
          onPress: () => {
            abandonMission(userMission.id);
            router.push(`/report/${userMission.id}`);
          },
        },
      ],
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
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

          <View style={styles.livesRow}>
            <View style={styles.livesDots}>
              {Array.from({ length: userMission.allowed_fails }, (_, i) => i + 1).map((i) => (
                <View
                  key={i}
                  style={[
                    styles.lifeDot,
                    { backgroundColor: i <= livesRemaining ? Colors.light.success : Colors.light.warning },
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
          />

          <View style={styles.streakRow}>
            <ThemedText type="smallBold">🔥 Sequência: {checkInDates.length} check-ins</ThemedText>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleCheckIn}
            disabled={alreadyCheckedInToday}
            accessibilityLabel={alreadyCheckedInToday ? 'Check-in já feito hoje' : 'Fazer check-in do dia'}
            style={({ pressed }) => [
              styles.checkInButton,
              alreadyCheckedInToday && styles.checkInButtonDone,
              pressed && !alreadyCheckedInToday && styles.checkInButtonPressed,
            ]}>
            <CheckRingIcon
              done={alreadyCheckedInToday}
              color={alreadyCheckedInToday ? Colors.light.secondary : Colors.light.textOnDark}
              size={22}
            />
            <ThemedText
              type="smallBold"
              themeColor={alreadyCheckedInToday ? 'secondary' : 'textOnDark'}>
              Check-in do Dia
            </ThemedText>
          </Pressable>

          <Pressable accessibilityRole="button" onPress={handleAbandon} style={styles.abandonLink}>
            <ThemedText type="small" themeColor="textSecondary">
              Abandonar Missão
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
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
    alignItems: 'center',
  },
  checkInButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.lg,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  checkInButtonPressed: {
    opacity: 0.85,
  },
  checkInButtonDone: {
    backgroundColor: Colors.light.backgroundElement,
  },
  abandonLink: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
