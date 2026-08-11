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
  /** Quantas vezes essa missão bateu especificamente esse nível (o melhor
   * já alcançado) — não o total de conclusões em qualquer nível. */
  count: number;
}

/** Uma entrada por missão do catálogo — mantém só o melhor (menor) nível já
 * alcançado, mesmo que o usuário tenha repetido a missão várias vezes
 * ("Tentar Novamente", já suportado pelo catálogo), mais quantas vezes
 * bateu esse nível específico. */
export function computeBestMedals(missionHistory: UserMissionView[]): MissionMedal[] {
  const bestTier = new Map<string, MedalTier>();
  const meta = new Map<string, { title: string; iconName: string }>();

  for (const view of missionHistory) {
    if (view.state.status !== 'completed') continue;
    const tier = getMedalTier(view.state.fails_count, view.userMission.allowed_fails);
    if (tier === null) continue;

    meta.set(view.mission.id, { title: view.mission.title, iconName: view.mission.icon_name });
    const existing = bestTier.get(view.mission.id);
    if (existing === undefined || tier < existing) bestTier.set(view.mission.id, tier);
  }

  const counts = new Map<string, number>();
  for (const view of missionHistory) {
    if (view.state.status !== 'completed') continue;
    const tier = getMedalTier(view.state.fails_count, view.userMission.allowed_fails);
    if (tier !== null && tier === bestTier.get(view.mission.id)) {
      counts.set(view.mission.id, (counts.get(view.mission.id) ?? 0) + 1);
    }
  }

  return Array.from(bestTier.entries())
    .map(([missionId, tier]) => {
      const missionMeta = meta.get(missionId);
      return {
        missionId,
        missionTitle: missionMeta?.title ?? '',
        missionIconName: missionMeta?.iconName ?? '',
        tier,
        count: counts.get(missionId) ?? 0,
      };
    })
    .sort((a, b) => a.tier - b.tier || a.missionTitle.localeCompare(b.missionTitle));
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
