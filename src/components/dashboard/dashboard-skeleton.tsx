import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/ui/skeleton';
import { SurfaceCard } from '@/components/ui/surface-card';
import { ThemedView } from '@/components/themed-view';
import { Spacing, TabBarClearance } from '@/constants/theme';

/** Ghost loading do dashboard (CONTEXT.md Log de Decisões #18) — mesmo
 * container/padding de `home.tsx`, pra não ter salto de layout quando o
 * conteúdo real substitui. */
export function DashboardSkeleton() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
          <View style={styles.header}>
            <View style={styles.greetingBlock}>
              <Skeleton width={36} height={36} borderRadius={18} />
              <View style={styles.textBlock}>
                <Skeleton width={90} height={12} />
                <Skeleton width={140} height={22} />
              </View>
            </View>
            <Skeleton width={64} height={36} borderRadius={18} />
          </View>

          <SurfaceCard style={styles.card}>
            <Skeleton width={100} height={12} />
            <Skeleton width="90%" height={16} />
            <Skeleton width="60%" height={16} />
          </SurfaceCard>

          <SurfaceCard variant="strong" style={styles.card}>
            <Skeleton width={140} height={12} />
            {[0, 1].map((i) => (
              <View key={i} style={styles.row}>
                <Skeleton width={36} height={36} borderRadius={12} />
                <View style={styles.rowText}>
                  <Skeleton width="70%" height={14} />
                  <Skeleton width="40%" height={10} />
                </View>
                <Skeleton width={44} height={44} borderRadius={22} />
              </View>
            ))}
          </SurfaceCard>

          <SurfaceCard style={styles.card}>
            <Skeleton width={130} height={12} />
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.row}>
                <Skeleton width={32} height={32} borderRadius={10} />
                <View style={styles.rowText}>
                  <Skeleton width="65%" height={14} />
                  <Skeleton width="35%" height={10} />
                </View>
              </View>
            ))}
          </SurfaceCard>

          <SurfaceCard style={styles.card}>
            <Skeleton width={150} height={12} />
            <View style={styles.statsRow}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.statItem}>
                  <Skeleton width={18} height={18} borderRadius={9} />
                  <Skeleton width="80%" height={20} />
                  <Skeleton width="60%" height={10} />
                </View>
              ))}
            </View>
          </SurfaceCard>
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
  card: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
});
