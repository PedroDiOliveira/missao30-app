import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Skeleton } from '@/components/ui/skeleton';
import { SurfaceCard } from '@/components/ui/surface-card';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';

/** Ghost loading do catálogo (CONTEXT.md Log de Decisões #18) — mesmo
 * container de `missions.tsx`. */
export function CatalogSkeleton() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
          <Skeleton width={140} height={28} style={styles.inset} />

          <View style={styles.inset}>
            <View style={styles.banner}>
              <Skeleton width={40} height={40} borderRadius={Radius.sm} />
              <View style={styles.bannerText}>
                <Skeleton width="70%" height={14} />
                <Skeleton width="90%" height={12} />
              </View>
            </View>
          </View>

          <View style={styles.carouselRow}>
            {[0, 1].map((i) => (
              <View key={i} style={styles.carouselCard}>
                <Skeleton width={52} height={52} borderRadius={Radius.md} />
                <Skeleton width="80%" height={16} />
                <Skeleton width="100%" height={12} />
                <Skeleton width="60%" height={12} />
              </View>
            ))}
          </View>

          <View style={styles.chipsRow}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} width={70} height={32} borderRadius={Radius.sm} />
            ))}
          </View>

          <SurfaceCard style={[styles.gradeCard, styles.inset]}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.row}>
                <Skeleton width={44} height={44} borderRadius={Radius.sm} />
                <View style={styles.rowText}>
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="35%" height={12} />
                </View>
              </View>
            ))}
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
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  inset: {
    marginHorizontal: Spacing.four,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.lg,
  },
  bannerText: {
    flex: 1,
    gap: Spacing.two,
  },
  carouselRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  carouselCard: {
    flex: 1,
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Radius.lg,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  gradeCard: {
    gap: Spacing.four,
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
});
