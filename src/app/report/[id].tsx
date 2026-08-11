import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressGrid } from '@/components/mission/progress-grid';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BackButton } from '@/components/ui/back-button';
import { MedalRingIcon } from '@/components/ui/medal-ring-icon';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Radius, Spacing } from '@/constants/theme';
import { useMissionsData } from '@/context/missions-context';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORY_LABEL } from '@/lib/catalog';
import { UiIcons } from '@/lib/icons';
import { getMedalTier, MEDAL_TIER_LABEL, type MedalTier } from '@/lib/medals';
import type { UserMissionStatus } from '@/lib/types';

// Tom sempre sem culpa (CONTEXT.md Seção 1) — "abandoned" não é tratado
// como fracasso, e "failed" não usa linguagem de alarme.
const STATUS_MESSAGE: Record<Exclude<UserMissionStatus, 'active'>, string> = {
  completed: 'Missão Cumprida! 🎉',
  failed: 'Quase lá, tente de novo',
  abandoned: 'Essa não era a missão certa — bora tentar outra?',
};

/**
 * Relatório (CONTEXT.md Seção 8, Tela 4) — fechamento de uma missão que
 * deixou de estar ativa. Dona da regra inversa de `mission/[id].tsx`: id
 * não encontrado → /home; encontrado mas ainda ativo → /mission/[id]
 * (relatório não é pra missão em andamento); terminal → renderiza aqui.
 */
export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { getMissionById } = useMissionsData();
  const mission = getMissionById(id);

  if (!mission) {
    return <Redirect href="/home" />;
  }
  if (mission.state.status === 'active') {
    return <Redirect href={`/mission/${id}`} />;
  }

  const { userMission, mission: missionInfo, state, checkInDates } = mission;
  const status = state.status as Exclude<UserMissionStatus, 'active'>;

  // Reveal da medalha — só existe pra missões concluídas (CONTEXT.md
  // Log de Decisões #15). Cor do nível 1 precisa ser `textOnDark` aqui: é a
  // mesma cor de fundo do hero (`theme.secondary`), senão o anel some —
  // mesmo cuidado já tomado com o AppMark (prop `onDark`).
  const medalTier: MedalTier | null =
    status === 'completed' ? getMedalTier(state.fails_count, userMission.allowed_fails) : null;
  const medalColorOnDark: Record<MedalTier, string> = {
    1: theme.textOnDark,
    2: theme.success,
    3: theme.warning,
  };

  const checkInsCount = checkInDates.length;
  const completionRate = Math.round((checkInsCount / userMission.duration_days) * 100);

  const metrics = [
    { Icon: UiIcons.stats, value: checkInsCount, label: 'Check-ins\nrealizados' },
    { Icon: UiIcons.missed, value: state.fails_count, label: 'Faltas\nusadas' },
    { Icon: UiIcons.percent, value: `${completionRate}%`, label: 'Aproveita-\nmento' },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <BackButton />

          <SurfaceCard variant="strong" style={styles.hero}>
            <ThemedText type="smallBold" themeColor="textOnDarkSecondary" style={styles.category}>
              {CATEGORY_LABEL[missionInfo.category].toUpperCase()}
            </ThemedText>
            <ThemedText type="title" themeColor="textOnDark" style={styles.missionTitle}>
              {missionInfo.title}
            </ThemedText>
            <ThemedText type="default" themeColor="textOnDark" style={styles.statusMessage}>
              {STATUS_MESSAGE[status]}
            </ThemedText>

            {medalTier && (
              <View style={styles.medalRow}>
                <MedalRingIcon tier={medalTier} color={medalColorOnDark[medalTier]} size={32} />
                <ThemedText type="smallBold" themeColor="textOnDark">
                  {MEDAL_TIER_LABEL[medalTier]}
                </ThemedText>
              </View>
            )}
          </SurfaceCard>

          <SurfaceCard style={styles.metricsCard}>
            {metrics.map((metric) => (
              <View key={metric.label} style={styles.metric}>
                <metric.Icon size={18} color={theme.primary} />
                <ThemedText type="default" style={styles.metricValue}>
                  {metric.value}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {metric.label}
                </ThemedText>
              </View>
            ))}
          </SurfaceCard>

          <SurfaceCard style={styles.gridCard}>
            <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
              SUA JORNADA DE 30 DIAS
            </ThemedText>
            <ProgressGrid
              durationDays={userMission.duration_days}
              dayNumber={state.day_number}
              startDate={userMission.start_date}
              checkInDates={checkInDates}
              isActive={false}
            />
          </SurfaceCard>

          <Pressable
            onPress={() => router.push('/missions')}
            style={[styles.ctaButton, { backgroundColor: theme.primary }]}
            accessibilityRole="button">
            <ThemedText type="smallBold" themeColor="textOnDark">
              Ver Catálogo
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
  hero: {
    gap: Spacing.two,
  },
  category: {
    letterSpacing: 1,
  },
  missionTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  statusMessage: {
    marginTop: Spacing.one,
  },
  medalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  metricsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
    alignItems: 'flex-start',
    gap: Spacing.half,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  gridCard: {
    gap: Spacing.three,
  },
  eyebrow: {
    letterSpacing: 0.5,
  },
  ctaButton: {
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
