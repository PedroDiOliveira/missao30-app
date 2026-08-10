/**
 * Seletor puro pro card de estatísticas rápidas do dashboard — nada aqui é
 * precomputado/armazenado no modelo de dados, tudo é derivado sob demanda a
 * partir de activeMissions + missionHistory, mesmo princípio já usado na
 * grade de 30 dias (CONTEXT.md Seção 7).
 */

import type { UserMissionView } from '@/lib/types';

export interface QuickStats {
  totalCompletedMissions: number;
  currentBestStreak: number;
  totalLifetimeCheckIns: number;
  completionRate: number | null; // null quando não há nenhuma missão encerrada ainda
}

export function computeQuickStats(
  activeMissions: UserMissionView[],
  missionHistory: UserMissionView[],
): QuickStats {
  const totalCompletedMissions = missionHistory.filter((m) => m.state.status === 'completed').length;

  // Streak perdoador (CONTEXT.md Seção 7) = total de check-ins da missão;
  // aqui pegamos a maior entre as ativas.
  const currentBestStreak = activeMissions.reduce((best, m) => Math.max(best, m.checkInDates.length), 0);

  const totalLifetimeCheckIns = [...activeMissions, ...missionHistory].reduce(
    (sum, m) => sum + m.checkInDates.length,
    0,
  );

  const completionRate =
    missionHistory.length === 0 ? null : totalCompletedMissions / missionHistory.length;

  return { totalCompletedMissions, currentBestStreak, totalLifetimeCheckIns, completionRate };
}
