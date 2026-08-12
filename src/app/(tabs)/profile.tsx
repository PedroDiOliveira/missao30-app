import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountCard } from '@/components/profile/account-card';
import { ActivityGraphCard } from '@/components/profile/activity-graph-card';
import { MedalsCard } from '@/components/profile/medals-card';
import { ProfileSkeleton } from '@/components/profile/profile-skeleton';
import { ReminderCard } from '@/components/profile/reminder-card';
import { StatsCard } from '@/components/profile/stats-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppMark } from '@/components/ui/app-mark';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing, TabBarClearance } from '@/constants/theme';
import { useMissionsData } from '@/context/missions-context';
import { useProfileData } from '@/context/profile-context';
import { computeQuickStats } from '@/lib/stats';

/**
 * Perfil (CONTEXT.md Seção 8, Tela 6) — cartão-hero de identidade (com o
 * número de missões concluídas em destaque, estilo "perfil pra ter orgulho
 * de mostrar" — Steam/Strava/Duolingo), depois o gráfico de atividade, o
 * resto das estatísticas, medalhas e configurações. As medalhas/config são
 * seções a mais na tela, não o centro dela.
 */
export default function ProfileScreen() {
  const { activeMissions, missionHistory, loading: missionsLoading } = useMissionsData();
  const { profile, loading: profileLoading, updateReminder } = useProfileData();
  const [actionError, setActionError] = useState<string | null>(null);
  const { totalCompletedMissions } = computeQuickStats(activeMissions, missionHistory);

  if (missionsLoading || profileLoading || !profile) return <ProfileSkeleton />;

  async function handleChangeTime(time: string) {
    try {
      await updateReminder(time, profile!.reminder_enabled);
    } catch {
      setActionError('Não foi possível salvar o horário do lembrete agora. Tente de novo em instantes.');
    }
  }

  async function handleToggleEnabled(enabled: boolean) {
    try {
      await updateReminder(profile!.reminder_time, enabled);
    } catch {
      setActionError('Não foi possível salvar essa alteração agora. Tente de novo em instantes.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SurfaceCard variant="strong" style={styles.hero}>
            <AppMark size={40} onDark />
            <ThemedText type="title" themeColor="textOnDark" style={styles.heroName}>
              {profile.full_name}
            </ThemedText>

            <View style={styles.heroStat}>
              <ThemedText type="title" themeColor="textOnDark" style={styles.heroNumber}>
                {totalCompletedMissions}
              </ThemedText>
              <ThemedText type="smallBold" themeColor="textOnDarkSecondary" style={styles.heroLabel}>
                MISSÕES CONCLUÍDAS
              </ThemedText>
            </View>
          </SurfaceCard>

          <ActivityGraphCard activeMissions={activeMissions} missionHistory={missionHistory} />

          <StatsCard activeMissions={activeMissions} missionHistory={missionHistory} />

          <MedalsCard missionHistory={missionHistory} />

          <ReminderCard
            reminderTime={profile.reminder_time}
            reminderEnabled={profile.reminder_enabled}
            onChangeTime={handleChangeTime}
            onToggleEnabled={handleToggleEnabled}
          />

          <AccountCard />
        </ScrollView>
      </SafeAreaView>

      <ConfirmDialog visible={actionError !== null} onClose={() => setActionError(null)} title="Ops" message={actionError ?? ''} />
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
    paddingBottom: TabBarClearance,
    gap: Spacing.four,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    gap: Spacing.two,
  },
  heroName: {
    fontSize: 26,
    lineHeight: 30,
  },
  heroStat: {
    marginTop: Spacing.two,
    gap: Spacing.half,
  },
  heroNumber: {
    fontSize: 56,
    lineHeight: 60,
  },
  heroLabel: {
    letterSpacing: 0.5,
  },
});
