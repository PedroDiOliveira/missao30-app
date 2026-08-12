/**
 * Camada de dados do perfil — mesmo padrão de indireção de `AuthProvider`
 * (sessão) e `MissionsProvider` (missões): um domínio próprio, com seu
 * próprio Provider e hook (CONTEXT.md Log de Decisões #20). Nome/avatar são
 * só leitura nesta rodada; lembrete é o primeiro campo de perfil que fica
 * de verdade editável e persistido.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  updateReminder: (time: string, enabled: boolean) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

// PostgREST serializa a coluna `time` do Postgres como 'HH:MM:SS' — o tipo
// `Profile.reminder_time` (lib/types.ts) documenta 'HH:MM' como formato, e é
// isso que os chips de horário pré-definido (`ReminderCard`) comparam por
// igualdade exata. Sem truncar aqui, nenhum chip nunca fica marcado como
// selecionado (o valor do banco nunca bate com nenhum preset).
function normalizeProfile(row: Profile): Profile {
  return { ...row, reminder_time: row.reminder_time.slice(0, 5) };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      setProfile(normalizeProfile(data));
    } catch (err) {
      console.error('Falha ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Mesma técnica de `missions-context.tsx`: despachar via microtask evita
    // que o efeito chame setState de forma direta/síncrona no guard de
    // usuário nulo (react-hooks/set-state-in-effect), sem mudar a
    // reatividade (ainda roda de novo sempre que `user` muda).
    Promise.resolve().then(() => loadProfile());
  }, [loadProfile]);

  const updateReminder = useCallback(
    async (time: string, enabled: boolean) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .update({ reminder_time: time, reminder_enabled: enabled })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      setProfile(normalizeProfile(data));
    },
    [user],
  );

  const value = useMemo<ProfileContextValue>(
    () => ({ profile, loading, updateReminder }),
    [profile, loading, updateReminder],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileData(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfileData precisa ser usado dentro de <ProfileProvider>');
  return ctx;
}
