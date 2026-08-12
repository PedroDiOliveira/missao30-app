import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Skeleton } from '@/components/ui/skeleton';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing, TabBarClearance } from '@/constants/theme';

/** Ghost loading do perfil (CONTEXT.md Log de Decisões #18) — mesmo
 * container de `profile.tsx`. */
export function ProfileSkeleton() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
          <SurfaceCard variant="strong" style={styles.hero}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <Skeleton width={160} height={26} />
            <View style={styles.heroStat}>
              <Skeleton width={90} height={48} />
              <Skeleton width={140} height={12} />
            </View>
          </SurfaceCard>

          <SurfaceCard style={styles.card}>
            <Skeleton width={150} height={12} />
            <Skeleton width={110} height={20} />
            <Skeleton width="100%" height={90} />
          </SurfaceCard>

          <SurfaceCard style={styles.card}>
            <Skeleton width={140} height={12} />
            <View style={styles.grid}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.gridItem}>
                  <Skeleton width={18} height={18} borderRadius={9} />
                  <Skeleton width="70%" height={20} />
                  <Skeleton width="90%" height={10} />
                </View>
              ))}
            </View>
          </SurfaceCard>

          <SurfaceCard style={styles.card}>
            <Skeleton width={130} height={12} />
            <View style={styles.row3}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.medalItem}>
                  <Skeleton width={32} height={32} borderRadius={16} />
                  <Skeleton width="60%" height={18} />
                  <Skeleton width="90%" height={10} />
                </View>
              ))}
            </View>
          </SurfaceCard>

          <SurfaceCard style={styles.card}>
            <View style={styles.reminderHeader}>
              <Skeleton width={140} height={12} />
              <Skeleton width={40} height={22} borderRadius={11} />
            </View>
            <View style={styles.chipsRow}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} width={64} height={30} borderRadius={10} />
              ))}
            </View>
          </SurfaceCard>

          <SurfaceCard style={styles.card}>
            <Skeleton width={70} height={12} />
            <Skeleton width="80%" height={16} />
            <Skeleton width="40%" height={16} />
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
  hero: {
    gap: Spacing.two,
  },
  heroStat: {
    marginTop: Spacing.two,
    gap: Spacing.half,
  },
  card: {
    gap: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
  },
  gridItem: {
    width: '42%',
    flexGrow: 1,
    gap: Spacing.half,
    alignItems: 'flex-start',
  },
  row3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medalItem: {
    flex: 1,
    alignItems: 'flex-start',
    gap: Spacing.half,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
