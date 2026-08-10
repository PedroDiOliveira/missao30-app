import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import type { SettlementNotice } from '@/lib/types';

const STATUS_LABEL: Record<SettlementNotice['newStatus'], string> = {
  completed: '🎉 chegou ao fim — Missão Cumprida!',
  failed: 'chegou ao fim — quase lá, tenta de novo',
  abandoned: 'foi abandonada',
};

interface SettlementNoticeBannerProps {
  notices: SettlementNotice[];
  onDismiss: (userMissionId: string) => void;
}

/** Avisos de missões que assentaram como terminais (CONTEXT.md Seção 7) —
 * não some sozinho da lista de ativas, só sinaliza pra onde ir ver o
 * relatório; dispensar aqui não afeta o estado da missão. */
export function SettlementNoticeBanner({ notices, onDismiss }: SettlementNoticeBannerProps) {
  if (notices.length === 0) return null;

  return (
    <View style={styles.container}>
      {notices.map((notice) => (
        <SurfaceCard key={notice.userMissionId} style={styles.banner}>
          <Pressable
            style={styles.content}
            onPress={() => router.push(`/report/${notice.userMissionId}`)}
            accessibilityRole="button">
            <ThemedText type="smallBold">
              {notice.missionTitle} {STATUS_LABEL[notice.newStatus]}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Toque pra ver o relatório
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => onDismiss(notice.userMissionId)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Dispensar aviso">
            <ThemedText type="default" themeColor="textSecondary">
              ✕
            </ThemedText>
          </Pressable>
        </SurfaceCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  content: {
    flex: 1,
    gap: Spacing.half,
  },
});
