import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MissionStatusBadge } from '@/components/catalog/mission-status-badge';
import { ThemedText } from '@/components/themed-text';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORY_LABEL, getCatalogStatus, getMissionAchievement } from '@/lib/catalog';
import { CATALOG_ICONS, DEFAULT_CATALOG_ICON } from '@/lib/icons';
import type { Mission, UserMissionView } from '@/lib/types';

interface MissionDetailModalProps {
  missionId: string | null;
  onClose: () => void;
  missionCatalog: Mission[];
  allUserMissions: UserMissionView[];
  activeMissionsCount: number;
  maxActiveMissions: number;
  onAccept: (missionId: string) => Promise<string>;
}

/** Modal compartilhado pelo carrossel e pela grade (CONTEXT.md Seção 8,
 * Tela 2) — a ação disponível depende do selo de status da missão: aceitar
 * (disponível), "ver missão" (já ativa, sem duplicar), tentar de novo
 * (terminal), ou a prevenção proativa do limite (CONTEXT.md Decisão #10). */
export function MissionDetailModal({
  missionId,
  onClose,
  missionCatalog,
  allUserMissions,
  activeMissionsCount,
  maxActiveMissions,
  onAccept,
}: MissionDetailModalProps) {
  const theme = useTheme();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // "Sticky": mantém a última missão resolvida enquanto o modal anima pra
  // fechar (missionId já virou null nesse momento, mas o conteúdo não pode
  // sumir antes da animação de saída do AnimatedModal terminar). Derivado
  // durante o render, não num efeito (react-hooks/set-state-in-effect).
  const [displayMission, setDisplayMission] = useState<Mission | undefined>(() =>
    missionId ? missionCatalog.find((m) => m.id === missionId) : undefined,
  );
  const [prevMissionId, setPrevMissionId] = useState(missionId);
  if (missionId !== prevMissionId) {
    setPrevMissionId(missionId);
    if (missionId) {
      setDisplayMission(missionCatalog.find((m) => m.id === missionId));
      setError(null);
    }
  }

  const mission = displayMission;
  const { status, latest } = mission
    ? getCatalogStatus(mission.id, allUserMissions)
    : { status: 'available' as const, latest: undefined };
  const achievement = mission ? getMissionAchievement(mission.id, allUserMissions) : { kind: 'never_tried' as const };
  const atCap = activeMissionsCount >= maxActiveMissions;
  const Icon = mission ? (CATALOG_ICONS[mission.icon_name] ?? DEFAULT_CATALOG_ICON) : DEFAULT_CATALOG_ICON;

  async function handleAccept() {
    if (!mission) return;
    setError(null);
    setAccepting(true);
    try {
      const newUserMissionId = await onAccept(mission.id);
      onClose();
      router.push(`/mission/${newUserMissionId}`);
    } catch {
      setError('Não foi possível aceitar a missão agora. Tente de novo em instantes.');
    } finally {
      setAccepting(false);
    }
  }

  function handleViewActive() {
    if (!latest) return;
    onClose();
    router.push(`/mission/${latest.userMission.id}`);
  }

  return (
    <AnimatedModal visible={missionId !== null} onClose={onClose}>
      {mission && (
        <>
          <View style={[styles.iconBadge, { backgroundColor: theme.background }]}>
            <Icon size={28} color={theme.secondary} />
          </View>

          <MissionStatusBadge achievement={achievement} />

          <ThemedText type="default" style={styles.title}>
            {mission.title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
            {mission.description}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {CATEGORY_LABEL[mission.category]} · Duração: {mission.duration_days} dias · Faltas permitidas:{' '}
            {mission.allowed_fails}
          </ThemedText>

          {error && (
            <ThemedText type="small" themeColor="warning">
              {error}
            </ThemedText>
          )}

          {status === 'active' ? (
            <Pressable
              onPress={handleViewActive}
              style={[styles.actionButton, { backgroundColor: theme.secondary }]}
              accessibilityRole="button">
              <ThemedText type="smallBold" themeColor="textOnDark">
                Ver missão
              </ThemedText>
            </Pressable>
          ) : atCap ? (
            <View style={[styles.capNotice, { backgroundColor: theme.background }]}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.capText}>
                Limite de {maxActiveMissions} missões simultâneas atingido — encerre uma missão ativa pra aceitar
                outra.
              </ThemedText>
            </View>
          ) : (
            <Pressable
              onPress={handleAccept}
              disabled={accepting}
              style={[styles.actionButton, { backgroundColor: theme.primary }, accepting && styles.disabled]}
              accessibilityRole="button">
              <ThemedText type="smallBold" themeColor="textOnDark">
                {status === 'available' ? 'Aceitar Missão' : 'Tentar Novamente'}
              </ThemedText>
            </Pressable>
          )}
        </>
      )}
    </AnimatedModal>
  );
}

const styles = StyleSheet.create({
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  description: {
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  disabled: {
    opacity: 0.6,
  },
  capNotice: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    marginTop: Spacing.one,
  },
  capText: {
    lineHeight: 18,
  },
});
