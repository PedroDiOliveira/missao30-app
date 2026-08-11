import { StyleSheet, useWindowDimensions } from 'react-native';

import { YearActivityGraph } from '@/components/dashboard/year-activity-graph';
import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { buildCalendarYearGrid, buildCheckInCountsByDate } from '@/lib/activity';
import type { UserMissionView } from '@/lib/types';

// Precisa bater com o `maxWidth` do scrollContent de profile.tsx (mesmo
// valor usado em home.tsx/mission/[id].tsx pro conteúdo estreito, diferente
// do MaxContentWidth mais largo usado só no catálogo) — senão o gráfico
// calcula uma largura maior do que o card realmente tem em telas grandes.
const SCREEN_MAX_WIDTH = 480;
const SCREEN_PADDING = Spacing.four;
const CARD_PADDING = Spacing.four;

interface ActivityGraphCardProps {
  activeMissions: UserMissionView[];
  missionHistory: UserMissionView[];
}

/** Mesmo gráfico estilo GitHub já usado no modal de sequência
 * (`YearActivityGraph`, `lib/activity.ts`) — aqui como uma seção
 * permanente do perfil, não só um "molde de compartilhar" sob demanda. */
export function ActivityGraphCard({ activeMissions, missionHistory }: ActivityGraphCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const currentYear = new Date().getFullYear();
  const weeks = buildCalendarYearGrid(buildCheckInCountsByDate(activeMissions, missionHistory), currentYear);

  const screenWidth = Math.min(windowWidth, SCREEN_MAX_WIDTH) - SCREEN_PADDING * 2;
  const graphWidth = screenWidth - CARD_PADDING * 2;

  return (
    <SurfaceCard style={styles.card}>
      <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
        SUA ATIVIDADE EM {currentYear}
      </ThemedText>
      <YearActivityGraph weeks={weeks} width={graphWidth} />
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
});
