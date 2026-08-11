/**
 * Selo de status de uma missão do catálogo, cruzando `missionCatalog` com o
 * histórico completo do usuário (`allUserMissions`) — o catálogo (Tela 2,
 * CONTEXT.md Seção 8) nunca esconde uma missão, sempre mostra o que já
 * aconteceu com ela, se aconteceu algo.
 */

import type { MissionCategory, UserMissionView } from '@/lib/types';

export const CATEGORY_LABEL: Record<MissionCategory, string> = {
  study: 'Estudos',
  fitness: 'Treino',
  sleep: 'Sono',
  finance: 'Finanças',
};

export type CatalogStatus = 'available' | 'active' | 'completed' | 'failed' | 'abandoned';

export interface CatalogStatusInfo {
  status: CatalogStatus;
  /** Tentativa relevante (ativa, ou a terminal mais recente) — ausente quando `status === 'available'`. */
  latest?: UserMissionView;
}

/** A tentativa ativa sempre vence; sem uma ativa, pega a terminal mais
 * recente por start_date (o usuário pode ter tentado a mesma missão do
 * catálogo mais de uma vez — nada no schema impede reaceitar). */
export function getCatalogStatus(missionId: string, allUserMissions: UserMissionView[]): CatalogStatusInfo {
  const attempts = allUserMissions.filter((view) => view.mission.id === missionId);
  if (attempts.length === 0) return { status: 'available' };

  const active = attempts.find((view) => view.state.status === 'active');
  if (active) return { status: 'active', latest: active };

  const latest = [...attempts].sort((a, b) => (a.userMission.start_date < b.userMission.start_date ? 1 : -1))[0];
  return { status: latest.state.status as CatalogStatus, latest };
}
