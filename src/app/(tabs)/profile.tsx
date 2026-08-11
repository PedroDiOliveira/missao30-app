import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountCard } from '@/components/profile/account-card';
import { ActivityGraphCard } from '@/components/profile/activity-graph-card';
import { MedalsCard } from '@/components/profile/medals-card';
import { ReminderCard } from '@/components/profile/reminder-card';
import { StatsCard } from '@/components/profile/stats-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppMark } from '@/components/ui/app-mark';
import { Spacing, TabBarClearance } from '@/constants/theme';
import { useMissionsData } from '@/context/missions-context';
import { mockProfile } from '@/lib/mock-data';

// Placeholder de e-mail só pra exibição — `Profile` (CONTEXT.md Seção 5) não
// tem coluna de e-mail de propósito (isso vive em auth.users, não em
// profiles); sem autenticação real ainda, não há de onde puxar um e-mail
// de verdade.
const PLACEHOLDER_EMAIL = 'pedro@exemplo.com';

/**
 * Perfil (CONTEXT.md Seção 8, Tela 6) — identidade, depois medalhas
 * (Log de Decisões #15), depois configurações. As medalhas são uma seção a
 * mais na tela, não o centro dela.
 */
export default function ProfileScreen() {
  const { activeMissions, missionHistory } = useMissionsData();
  const [reminderTime, setReminderTime] = useState(mockProfile.reminder_time);
  const [reminderEnabled, setReminderEnabled] = useState(mockProfile.reminder_enabled);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <AppMark size={36} />
            <View style={styles.textBlock}>
              <ThemedText type="small" themeColor="textSecondary">
                {PLACEHOLDER_EMAIL}
              </ThemedText>
              <ThemedText type="title" style={styles.userName}>
                {mockProfile.full_name}
              </ThemedText>
            </View>
          </View>

          <StatsCard activeMissions={activeMissions} missionHistory={missionHistory} />

          <ActivityGraphCard activeMissions={activeMissions} missionHistory={missionHistory} />

          <MedalsCard missionHistory={missionHistory} />

          <ReminderCard
            reminderTime={reminderTime}
            reminderEnabled={reminderEnabled}
            onChangeTime={setReminderTime}
            onToggleEnabled={setReminderEnabled}
          />

          <AccountCard />
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
