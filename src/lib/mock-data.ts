/**
 * Perfil mockado — a única peça de mock que sobrevive à troca pra dados
 * reais (CONTEXT.md Log de Decisões #19). Catálogo e missões do usuário já
 * vêm do Supabase via `MissionsProvider`; perfil de verdade (nome,
 * lembrete) fica pra uma próxima rodada separada.
 */

import { daysAgo } from '@/lib/date';
import type { Profile } from '@/lib/types';

export const mockProfile: Profile = {
  id: 'mock-user',
  full_name: 'Pedro',
  avatar_url: null,
  reminder_time: '20:00',
  reminder_enabled: true,
  created_at: daysAgo(120),
};
