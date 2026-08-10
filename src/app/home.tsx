import * as Haptics from 'expo-haptics';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressGrid } from '@/components/mission/progress-grid';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { activeMissionMock } from '@/lib/mock-data';
import type { ActiveMissionView, MissionCategory } from '@/lib/types';

const CATEGORY_LABEL: Record<MissionCategory, string> = {
  study: 'Estudos',
  fitness: 'Treino',
  sleep: 'Sono',
  finance: 'Finanças',
};

function todayLocal(): string {
  // Mesma convenção do CONTEXT.md (Seção 7): data local do dispositivo,
  // nunca UTC bruto — é o que qualquer chamada real ao Supabase mandaria
  // como p_client_today.
  return new Date().toLocaleDateString('en-CA');
}

export default function HomeScreen() {
  // Estado local simulando o que get_user_mission_state() + o join com
  // check_ins devolveriam. Quando o Supabase entrar, troca-se só a origem
  // deste estado — o resto da tela não muda.
  const [mission, setMission] = useState<ActiveMissionView | null>(activeMissionMock);

  // CONTEXT.md Seção 7 — roteamento de estado vazio: sem missão ativa,
  // manda pro catálogo. Cobre tanto usuário novo quanto usuário que acabou
  // de terminar uma missão, com a mesma checagem.
  if (!mission) {
    return <Redirect href="/missions" />;
  }

  // CONTEXT.md Seção 7 — roteamento settle→relatório: uma missão que já
  // assentou como concluída/falha/abandonada não fica exibida aqui, vai
  // direto pro relatório (preserva o momento de fechamento).
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
    // Simula create_check_in(user_mission_id, hoje). A validação de janela
    // de datas e a checagem de "já existe check-in hoje" (CONTEXT.md Seção
    // 6) ficam a cargo da RPC de verdade quando o backend entrar.
    setMission((prev) => (prev ? { ...prev, checkInDates: [...prev.checkInDates, today] } : prev));
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
            // chamaria abandon_mission(user_mission_id) de verdade aqui
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
                    { backgroundColor: i <= livesRemaining ? Colors.dark.success : Colors.dark.warning },
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
            style={({ pressed }) => [
              styles.checkInButton,
              alreadyCheckedInToday && styles.checkInButtonDone,
              pressed && !alreadyCheckedInToday && styles.checkInButtonPressed,
            ]}>
            <ThemedText type="smallBold" style={styles.checkInButtonText}>
              {alreadyCheckedInToday ? 'Check-in Feito Hoje! 🔥' : 'Fazer Check-In do Dia'}
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
    backgroundColor: Colors.dark.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInButtonPressed: {
    opacity: 0.85,
  },
  checkInButtonDone: {
    backgroundColor: Colors.dark.backgroundElement,
  },
  checkInButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  abandonLink: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
