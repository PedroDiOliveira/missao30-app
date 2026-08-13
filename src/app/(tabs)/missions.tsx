import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CatalogHeroCarousel } from '@/components/catalog/catalog-hero-carousel';
import { CatalogMissionRow } from '@/components/catalog/catalog-mission-row';
import { CatalogSkeleton } from '@/components/catalog/catalog-skeleton';
import { CategoryFilterChips, type CategoryFilter } from '@/components/catalog/category-filter-chips';
import { CustomMissionBanner } from '@/components/catalog/custom-mission-banner';
import { MissionDetailModal } from '@/components/catalog/mission-detail-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppMark } from '@/components/ui/app-mark';
import { SurfaceCard } from '@/components/ui/surface-card';
import { MaxContentWidth, Spacing, TabBarClearance } from '@/constants/theme';
import { useMissionsData } from '@/context/missions-context';

/**
 * Catálogo (CONTEXT.md Seção 8, Tela 2) — sensação de "navegação", não uma
 * lista simples: carrossel de destaque com todas as missões no topo, grade
 * filtrável por categoria abaixo. Toda missão aparece sempre, com um selo
 * de status (Ativa/Concluída/etc.) — o catálogo nunca esconde nada. O
 * banner de missão personalizada leva pro formulário de verdade
 * (`/create-mission`, liberado pra todo mundo) — deixou de ser teaser de
 * recurso pago (CONTEXT.md Log de Decisões, corrige a Decisão #14).
 */
export default function MissionsScreen() {
  const { missionCatalog, allUserMissions, activeMissions, maxActiveMissions, acceptMission, loading } =
    useMissionsData();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  if (loading) return <CatalogSkeleton />;

  const atCap = activeMissions.length >= maxActiveMissions;
  // is_published === false já basta pra dizer "é minha" — RLS só devolve
  // uma missão despublicada se ela pertencer a quem está logado.
  const myMissions = missionCatalog.filter((m) => !m.is_published);
  const curatedCatalog = missionCatalog.filter((m) => m.is_published);
  const filteredMissions =
    category === 'all' ? curatedCatalog : curatedCatalog.filter((m) => m.category === category);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.header, styles.inset]}>
            <AppMark size={36} />
            <ThemedText type="title" style={styles.heading}>
              Catálogo
            </ThemedText>
          </View>

          <View style={styles.inset}>
            <CustomMissionBanner onPress={() => router.push('/create-mission')} />
          </View>

          {myMissions.length > 0 && (
            <SurfaceCard style={[styles.gradeCard, styles.inset]}>
              <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
                MINHAS MISSÕES
              </ThemedText>
              {myMissions.map((mission) => (
                <CatalogMissionRow
                  key={mission.id}
                  mission={mission}
                  allUserMissions={allUserMissions}
                  onPress={() => setSelectedMissionId(mission.id)}
                />
              ))}
            </SurfaceCard>
          )}

          {atCap && (
            <SurfaceCard style={styles.inset}>
              <ThemedText type="small" themeColor="warning">
                Limite de {maxActiveMissions} missões simultâneas atingido — encerre uma missão ativa pra aceitar
                outra.
              </ThemedText>
            </SurfaceCard>
          )}

          <CatalogHeroCarousel
            missions={curatedCatalog}
            allUserMissions={allUserMissions}
            onSelect={setSelectedMissionId}
          />

          <CategoryFilterChips selected={category} onSelect={setCategory} />

          <SurfaceCard style={[styles.gradeCard, styles.inset]}>
            {filteredMissions.map((mission) => (
              <CatalogMissionRow
                key={mission.id}
                mission={mission}
                allUserMissions={allUserMissions}
                onPress={() => setSelectedMissionId(mission.id)}
              />
            ))}
          </SurfaceCard>
        </ScrollView>
      </SafeAreaView>

      <MissionDetailModal
        missionId={selectedMissionId}
        onClose={() => setSelectedMissionId(null)}
        missionCatalog={missionCatalog}
        allUserMissions={allUserMissions}
        activeMissionsCount={activeMissions.length}
        maxActiveMissions={maxActiveMissions}
        onAccept={acceptMission}
      />
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
    paddingBottom: TabBarClearance,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  inset: {
    marginHorizontal: Spacing.four,
  },
  header: {
    gap: Spacing.two,
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
  },
  gradeCard: {
    gap: Spacing.four,
  },
  eyebrow: {
    letterSpacing: 0.5,
  },
});
