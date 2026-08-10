import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActiveMissionsCard } from '@/components/dashboard/active-missions-card';
import { CategoryTipsCard } from '@/components/dashboard/category-tips-card';
import { QuickStatsCard } from '@/components/dashboard/quick-stats-card';
import { SettlementNoticeBanner } from '@/components/dashboard/settlement-notice-banner';
import { ShortcutsCard } from '@/components/dashboard/shortcuts-card';
import { SuggestedMissionsCard } from '@/components/dashboard/suggested-missions-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppMark } from '@/components/ui/app-mark';
import { Spacing, TabBarClearance } from '@/constants/theme';
import { useMissionsData } from '@/context/missions-context';

/**
 * Dashboard — nova tela de entrada (CONTEXT.md Seção 3/§7). Nunca redireciona
 * pra fora de si mesma, nem com 0 missões ativas (isso é responsabilidade do
 * ActiveMissionsCard, que renderiza o estado vazio inline). A lógica de
 * redirect por-missão que existia aqui antes se mudou pra /mission/[id].
 */
export default function DashboardScreen() {
  const { activeMissions, missionHistory, settlementNotices, maxActiveMissions, checkIn, dismissNotice } =
    useMissionsData();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="small" themeColor="textSecondary">
              Bem-vindo de volta
            </ThemedText>
            <View style={styles.brandRow}>
              <AppMark size={34} />
              <ThemedText type="title" style={styles.title}>
                Missão30
              </ThemedText>
            </View>
          </View>

          <SettlementNoticeBanner notices={settlementNotices} onDismiss={dismissNotice} />

          <ActiveMissionsCard
            activeMissions={activeMissions}
            maxActiveMissions={maxActiveMissions}
            onCheckIn={checkIn}
          />

          <SuggestedMissionsCard activeMissions={activeMissions} />
          <QuickStatsCard activeMissions={activeMissions} missionHistory={missionHistory} />
          <CategoryTipsCard activeMissions={activeMissions} />
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
    gap: Spacing.one,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
});
