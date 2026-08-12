import { useEffect, useState } from 'react';

const SIMULATED_DELAY_MS = 1200;

/**
 * Placeholder temporário (CONTEXT.md Log de Decisões #18) — só pra dar pra
 * ver e ajustar o ghost loading no preview antes de existir busca de dado
 * real. Remover junto da próxima etapa (trocar `mock-data.ts` por
 * consultas de verdade ao Supabase), quando cada tela ganhar seu próprio
 * estado de carregamento vindo da rede.
 */
export function useSimulatedLoading(): boolean {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), SIMULATED_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return loading;
}
