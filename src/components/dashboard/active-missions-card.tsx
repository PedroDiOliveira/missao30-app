import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ActiveMissionRow } from '@/components/dashboard/active-mission-row';
import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';
import type { UserMissionView } from '@/lib/types';

interface ActiveMissionsCardProps {
  activeMissions: UserMissionView[];
  maxActiveMissions: number;
  onCheckIn: (userMissionId: string) => void;
}

/** Card hero do dashboard — CONTEXT.md Seção 3/§7: nunca redireciona, o
 * estado vazio (0 missões ativas) é renderizado aqui mesmo, inline. */
export function ActiveMissionsCard({ activeMissions, maxActiveMissions, onCheckIn }: ActiveMissionsCardProps) {
  const theme = useTheme();
  const atCap = activeMissions.length >= maxActiveMissions;

  return (
    <SurfaceCard variant="strong" style={styles.card}>
      <ThemedText type="smallBold" themeColor="textOnDarkSecondary" style={styles.eyebrow}>
        SUAS MISSÕES ATIVAS
      </ThemedText>

      {activeMissions.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText type="default" themeColor="textOnDark">
            Você ainda não tem nenhuma missão ativa.
          </ThemedText>
          <Pressable
            onPress={() => router.push('/missions')}
            style={[styles.ctaButton, { backgroundColor: theme.primary }]}
            accessibilityRole="button">
            <ThemedText type="smallBold" themeColor="textOnDark">
              Começar uma missão
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.list}>
          {activeMissions.map((view) => (
            <ActiveMissionRow key={view.userMission.id} view={view} onCheckIn={onCheckIn} />
          ))}
        </View>
      )}

      {activeMissions.length > 0 && (
        <Pressable
          onPress={() => router.push('/missions')}
          disabled={atCap}
          style={styles.addRow}
          accessibilityRole="button">
          <UiIcons.add size={16} color={atCap ? theme.textOnDarkSecondary : theme.textOnDark} />
          <ThemedText type="small" themeColor={atCap ? 'textOnDarkSecondary' : 'textOnDark'}>
            {atCap ? `Limite de ${maxActiveMissions} missões simultâneas atingido` : 'Adicionar outra missão'}
          </ThemedText>
        </Pressable>
      )}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  eyebrow: {
    letterSpacing: 0.5,
  },
  emptyState: {
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  ctaButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
  },
  list: {
    gap: Spacing.four,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
});
