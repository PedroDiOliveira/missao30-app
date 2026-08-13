/**
 * Selo de status de uma missão do catálogo, cruzando `missionCatalog` com o
 * histórico completo do usuário (`allUserMissions`) — o catálogo (Tela 2,
 * CONTEXT.md Seção 8) nunca esconde uma missão, sempre mostra o que já
 * aconteceu com ela, se aconteceu algo.
 */

import { getMedalTier, type MedalTier } from '@/lib/medals';
import type { Mission, MissionCategory, UserMissionView } from '@/lib/types';

export const CATEGORY_LABEL: Record<MissionCategory, string> = {
  study: 'Estudos',
  fitness: 'Treino',
  sleep: 'Sono',
  finance: 'Finanças',
};

/** Ícone padrão por categoria pra missão personalizada (`/create-mission`)
 * — atribuído automaticamente, não é campo do formulário (mantém a etapa
 * de título+categoria em só 2 campos). Reaproveita ícones já mapeados em
 * `CATALOG_ICONS` (`lib/icons.ts`), nenhum novo. */
export const CATEGORY_DEFAULT_ICON: Record<MissionCategory, string> = {
  study: 'book-open',
  fitness: 'dumbbell',
  sleep: 'moon',
  finance: 'wallet',
};

/** Texto de meta da missão (duração/tolerância), cadência-aware — usado
 * no carrossel e no modal de detalhe do catálogo, fonte única pra não
 * duas telas descreverem a mesma missão com números diferentes. */
export function formatMissionCadence(mission: Mission): string {
  if (mission.cadence_unit === 'day') {
    return `Duração: ${mission.duration_days} dias · Faltas permitidas: ${mission.allowed_fails}`;
  }
  const weekLabel = mission.allowed_fails === 1 ? 'semana' : 'semanas';
  return `${mission.cadence_target}x por semana · ${mission.allowed_fails} ${weekLabel} de tolerância`;
}

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

/** Selo do catálogo em linguagem de conquista, não de status (CONTEXT.md
 * Log de Decisões #16) — nunca rotula um resultado passado ruim, só
 * convida (nunca tentada) ou celebra (medalha conquistada). */
export type MissionAchievement =
  | { kind: 'never_tried' }
  | { kind: 'active'; dayNumber: number; durationDays: number }
  | { kind: 'no_medal' }
  | { kind: 'medal'; tier: MedalTier; count: number };

export function getMissionAchievement(missionId: string, allUserMissions: UserMissionView[]): MissionAchievement {
  const attempts = allUserMissions.filter((view) => view.mission.id === missionId);
  if (attempts.length === 0) return { kind: 'never_tried' };

  const active = attempts.find((view) => view.state.status === 'active');
  if (active) {
    return { kind: 'active', dayNumber: active.state.day_number, durationDays: active.userMission.duration_days };
  }

  const completedTiers = attempts
    .filter((view) => view.state.status === 'completed')
    .map((view) => getMedalTier(view.state.fails_count, view.userMission.allowed_fails))
    .filter((tier): tier is MedalTier => tier !== null);

  if (completedTiers.length === 0) return { kind: 'no_medal' };

  const tier = Math.min(...completedTiers) as MedalTier;
  const count = completedTiers.filter((t) => t === tier).length;
  return { kind: 'medal', tier, count };
}
