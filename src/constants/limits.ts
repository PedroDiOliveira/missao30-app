/**
 * Limite de missões ativas simultâneas — CONTEXT.md, log de decisões
 * (reversão de "1 missão ativa" pra N, pensando em virar alavanca de
 * monetização mais pra frente). Nenhuma lógica real de plano/assinatura
 * existe ainda — só o valor provisório e a indireção via hook, no mesmo
 * padrão de `useTheme()`, pra trocar por uma checagem real depois sem
 * precisar tocar em cada tela que consulta o limite.
 */

export const MAX_ACTIVE_MISSIONS = 3;

export function useMaxActiveMissions(): number {
  return MAX_ACTIVE_MISSIONS;
}
