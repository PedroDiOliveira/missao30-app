/**
 * Assinatura — mockada de propósito (CONTEXT.md Log de Decisões), mesmo
 * espírito do antigo `mockProfile`: sempre `'free'` até existir cobrança de
 * verdade (nenhum provedor de pagamento escolhido ainda). A indireção via
 * hook é o que deixa isso pronto pra virar real depois sem precisar tocar
 * em quem consome — mesmo padrão que `useMaxActiveMissions()` já usava
 * sozinho antes desta tela existir.
 */

export type SubscriptionTier = 'free' | 'premium';

export function useSubscriptionTier(): SubscriptionTier {
  return 'free';
}

export const PREMIUM_MAX_ACTIVE_MISSIONS = 10;

// Placeholder — ajustar quando o preço de verdade for definido.
export const PREMIUM_PRICE_LABEL = 'R$ 14,90/mês';
