import { useEffect } from 'react';

import { useMissionsData } from '@/context/missions-context';
import { useProfileData } from '@/context/profile-context';
import { cancelReminderAsync, requestNotificationPermissionAsync, scheduleReminderAsync } from '@/lib/notifications';

/**
 * Sem UI — só o efeito de reconciliação entre missões e perfil (CONTEXT.md
 * Log de Decisões, novo item: um lembrete só por usuário, não por missão).
 * Único lugar do app que lê `useMissionsData()` e `useProfileData()` ao
 * mesmo tempo, de propósito — os dois providers continuam independentes
 * entre si, esta é a peça que os observa por fora e reage a qualquer
 * mudança relevante (aceitar/abandonar/assentar missão, ligar/desligar o
 * lembrete, mudar o horário, ou o app abrir de novo).
 */
export function NotificationSync() {
  const { activeMissions, loading: missionsLoading } = useMissionsData();
  const { profile, loading: profileLoading } = useProfileData();
  // Desestruturado em primitivos (em vez de referenciar `profile.*` dentro
  // do efeito) de propósito — assim a dependência do efeito é exatamente
  // os 2 campos que importam, não o objeto inteiro (que troca de
  // referência a cada fetch, mesmo quando nome/avatar mudam, campos que
  // não têm nada a ver com o lembrete).
  const reminderEnabled = profile?.reminder_enabled ?? false;
  const reminderTime = profile?.reminder_time;
  const activeMissionsCount = activeMissions.length;

  useEffect(() => {
    if (missionsLoading || profileLoading || !reminderTime) return;

    if (!(reminderEnabled && activeMissionsCount > 0)) {
      cancelReminderAsync().catch((err) => console.error('Falha ao cancelar lembrete:', err));
      return;
    }

    requestNotificationPermissionAsync()
      .then((granted) => (granted ? scheduleReminderAsync(reminderTime) : undefined))
      .catch((err) => console.error('Falha ao agendar lembrete:', err));
  }, [activeMissionsCount, reminderEnabled, reminderTime, missionsLoading, profileLoading]);

  return null;
}
