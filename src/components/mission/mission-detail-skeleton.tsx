import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Skeleton } from '@/components/ui/skeleton';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Radius, Spacing } from '@/constants/theme';

const GRID_DAYS = Array.from({ length: 30 }, (_, i) => i);

/** Ghost loading do detalhe de missão (CONTEXT.md Log de Decisões #18) —
 * mesmo container de `mission/[id].tsx`. */
export function MissionDetailSkeleton() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
          <Skeleton width={32} height={32} borderRadius={16} />

          <View style={styles.header}>
            <Skeleton width={90} height={12} />
            <Skeleton width="70%" height={26} />
            <Skeleton width={130} height={18} />
          </View>

          <SurfaceCard style={styles.card}>
            <View style={styles.livesRow}>
              <View style={styles.livesDots}>
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} width={12} height={12} borderRadius={6} />
                ))}
              </View>
              <Skeleton width={140} height={12} />
            </View>

            <View style={styles.grid}>
              {GRID_DAYS.map((i) => (
                <Skeleton key={i} width="15%" height={32} borderRadius={Radius.sm} />
              ))}
            </View>

            <View style={styles.streakRow}>
              <Skeleton width={16} height={16} borderRadius={8} />
              <Skeleton width={160} height={14} />
            </View>
          </SurfaceCard>

          <Skeleton width="100%" height={64} borderRadius={Radius.lg} />
          <Skeleton width={140} height={14} style={styles.abandonSkeleton} />
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
  card: {
    gap: Spacing.four,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  abandonSkeleton: {
    alignSelf: 'center',
  },
});
