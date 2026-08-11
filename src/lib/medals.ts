/**
 * Sistema de medalhas por missão (CONTEXT.md Log de Decisões #15) — quantas
 * faltas o usuário usou pra concluir aquela missão especificamente decide o
 * nível. Nada precomputado/armazenado: mesmo princípio já usado em
 * `stats.ts`/`mission-state.ts`, tudo derivado sob demanda a partir do
 * histórico.
 */

import type { UserMissionView } from '@/lib/types';

export type MedalTier = 1 | 2 | 3;

// Nomenclatura temática, provisória ("pensamos melhor depois" — ver
// CONTEXT.md Log de Decisões #15): a versão anterior ("Anel ___") foi
// trocada por soar com conotação sexual em português. "Resiliente" no
// nível 3 continua proposital: reforça a filosofia de tolerância a falhas
// (CONTEXT.md Seção 1) em vez de fazer o nível "mais fraco" soar como fracasso.
export const MEDAL_TIER_LABEL: Record<MedalTier, string> = {
  1: 'Impecável',
  2: 'Constante',
  3: 'Resiliente',
};

/** Fórmula genérica em cima de `allowedFails` (não hardcoded em 3), pra não
 * quebrar se uma missão futura tiver um limite de faltas diferente. */
export function getMedalTier(failsCount: number, allowedFails: number): MedalTier | null {
  if (failsCount === 0) return 1;
  if (failsCount === 1) return 2;
  if (failsCount <= allowedFails) return 3;
  return null; // não deveria ocorrer numa missão 'completed' — defensivo
}

export interface MissionMedal {
  missionId: string;
  missionTitle: string;
  missionIconName: string;
  tier: MedalTier;
}

/** Uma entrada por missão do catálogo — mantém só o melhor (menor) nível já
 * alcançado, mesmo que o usuário tenha repetido a missão várias vezes
 * ("Tentar Novamente", já suportado pelo catálogo). */
export function computeBestMedals(missionHistory: UserMissionView[]): MissionMedal[] {
  const best = new Map<string, MissionMedal>();

  for (const view of missionHistory) {
    if (view.state.status !== 'completed') continue;
    const tier = getMedalTier(view.state.fails_count, view.userMission.allowed_fails);
    if (tier === null) continue;

    const existing = best.get(view.mission.id);
    if (!existing || tier < existing.tier) {
      best.set(view.mission.id, {
        missionId: view.mission.id,
        missionTitle: view.mission.title,
        missionIconName: view.mission.icon_name,
        tier,
      });
    }
  }

  return Array.from(best.values()).sort((a, b) => a.tier - b.tier || a.missionTitle.localeCompare(b.missionTitle));
}

/** Conta quantas medalhas o usuário tem em cada nível — usado pelo card de
 * perfil, que mostra só o total por nível, sem apontar de qual missão veio
 * cada uma. Recebe o resultado de `computeBestMedals()` (não recalcula do
 * histórico), pra manter uma fonte única da regra "1 medalha por missão". */
export function countMedalsByTier(medals: MissionMedal[]): Record<MedalTier, number> {
  const counts: Record<MedalTier, number> = { 1: 0, 2: 0, 3: 0 };
  for (const medal of medals) counts[medal.tier] += 1;
  return counts;
}
