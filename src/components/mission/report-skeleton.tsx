import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Skeleton } from '@/components/ui/skeleton';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Radius, Spacing } from '@/constants/theme';

const GRID_DAYS = Array.from({ length: 30 }, (_, i) => i);

/** Ghost loading do relatório (CONTEXT.md Log de Decisões #18) — mesmo
 * container de `report/[id].tsx`. */
export function ReportSkeleton() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
          <Skeleton width={32} height={32} borderRadius={16} />

          <SurfaceCard variant="strong" style={styles.hero}>
            <Skeleton width={90} height={12} />
            <Skeleton width="70%" height={26} />
            <Skeleton width="50%" height={18} />
          </SurfaceCard>

          <SurfaceCard style={styles.metricsCard}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.metric}>
                <Skeleton width={18} height={18} borderRadius={9} />
                <Skeleton width="70%" height={20} />
                <Skeleton width="90%" height={10} />
              </View>
            ))}
          </SurfaceCard>

          <SurfaceCard style={styles.gridCard}>
            <Skeleton width={160} height={12} />
            <View style={styles.grid}>
              {GRID_DAYS.map((i) => (
                <Skeleton key={i} width="15%" height={32} borderRadius={Radius.sm} />
              ))}
            </View>
          </SurfaceCard>

          <Skeleton width="100%" height={56} borderRadius={Radius.lg} />
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
  metricsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
    alignItems: 'flex-start',
    gap: Spacing.half,
  },
  gridCard: {
    gap: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
