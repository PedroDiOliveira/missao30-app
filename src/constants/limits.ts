/**
 * Limite de missões ativas simultâneas — CONTEXT.md, log de decisões
 * (reversão de "1 missão ativa" pra N, pensando em virar alavanca de
 * monetização mais pra frente). `MAX_ACTIVE_MISSIONS` é o valor do plano
 * grátis; `useMaxActiveMissions()` já deriva do tier mockado de
 * `useSubscriptionTier()` (`constants/subscription.ts`) — pronto pra virar
 * checagem real quando existir cobrança, sem precisar tocar em quem já
 * consome o hook.
 */

import { PREMIUM_MAX_ACTIVE_MISSIONS, useSubscriptionTier, type SubscriptionTier } from '@/constants/subscription';

export const MAX_ACTIVE_MISSIONS = 3;

const MAX_ACTIVE_MISSIONS_BY_TIER: Record<SubscriptionTier, number> = {
  free: MAX_ACTIVE_MISSIONS,
  premium: PREMIUM_MAX_ACTIVE_MISSIONS,
};

export function useMaxActiveMissions(): number {
  const tier = useSubscriptionTier();
  return MAX_ACTIVE_MISSIONS_BY_TIER[tier];
}
