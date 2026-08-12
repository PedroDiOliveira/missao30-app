import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActiveMissionsCard } from '@/components/dashboard/active-missions-card';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { QuickStatsCard } from '@/components/dashboard/quick-stats-card';
import { QuoteOfTheDayCard } from '@/components/dashboard/quote-of-the-day-card';
import { SettlementNoticeBanner } from '@/components/dashboard/settlement-notice-banner';
import { ShortcutsCard } from '@/components/dashboard/shortcuts-card';
import { StreakBadge } from '@/components/dashboard/streak-badge';
import { SuggestedMissionsCard } from '@/components/dashboard/suggested-missions-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppMark } from '@/components/ui/app-mark';
import { Spacing, TabBarClearance } from '@/constants/theme';
import { useMissionsData } from '@/context/missions-context';
import { useProfileData } from '@/context/profile-context';

/**
 * Dashboard — nova tela de entrada (CONTEXT.md Seção 3/§7). Nunca redireciona
 * pra fora de si mesma, nem com 0 missões ativas (isso é responsabilidade do
 * ActiveMissionsCard, que renderiza o estado vazio inline). A lógica de
 * redirect por-missão que existia aqui antes se mudou pra /mission/[id].
 */
export default function DashboardScreen() {
  const {
    missionCatalog,
    activeMissions,
    missionHistory,
    settlementNotices,
    maxActiveMissions,
    checkIn,
    dismissNotice,
    loading: missionsLoading,
  } = useMissionsData();
  const { profile, loading: profileLoading } = useProfileData();

  if (missionsLoading || profileLoading || !profile) return <DashboardSkeleton />;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.greetingBlock}>
              <AppMark size={36} />
              <View style={styles.textBlock}>
                <ThemedText type="small" themeColor="textSecondary">
                  Bem-vindo de volta
                </ThemedText>
                <ThemedText type="title" style={styles.userName}>
                  {profile.full_name}
                </ThemedText>
              </View>
            </View>
            <StreakBadge activeMissions={activeMissions} missionHistory={missionHistory} />
          </View>

          <SettlementNoticeBanner notices={settlementNotices} onDismiss={dismissNotice} />

          <QuoteOfTheDayCard />

          <ActiveMissionsCard
            activeMissions={activeMissions}
            maxActiveMissions={maxActiveMissions}
            onCheckIn={checkIn}
          />

          <SuggestedMissionsCard missionCatalog={missionCatalog} activeMissions={activeMissions} />
          <QuickStatsCard activeMissions={activeMissions} missionHistory={missionHistory} />
          <ShortcutsCard />
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
    paddingBottom: TabBarClearance,
    gap: Spacing.four,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetingBlock: {
    gap: Spacing.two,
  },
  textBlock: {
    gap: Spacing.half,
  },
  userName: {
    fontSize: 26,
    lineHeight: 30,
  },
});
