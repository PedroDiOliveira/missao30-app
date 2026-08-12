/**
 * Lembrete diário local — CONTEXT.md Log de Decisões (novo item). Um único
 * lembrete recorrente por usuário (não por missão) — `notification-sync.tsx`
 * é quem decide *se* deve existir; este arquivo só sabe *como* agendar/
 * cancelar. Nunca há mais de um agendado ao mesmo tempo, então
 * cancelar-tudo-e-reagendar (em vez de rastrear um identificador) é seguro
 * e mais simples.
 */

import * as Notifications from 'expo-notifications';

const REMINDER_CHANNEL_ID = 'daily-reminder';
const REMINDER_TITLE = 'Check-in do dia';
const REMINDER_BODY = 'Alguns segundos agora garantem seu progresso de hoje.';

export async function requestNotificationPermissionAsync(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

// Sem guarda de plataforma: em iOS (sem suporte a canais), a própria lib
// resolve com `null` em vez de rejeitar — seguro chamar sempre.
async function ensureAndroidChannelAsync(): Promise<void> {
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Lembrete diário',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function scheduleReminderAsync(time: string): Promise<void> {
  const [hour, minute] = time.split(':').map(Number);
  await ensureAndroidChannelAsync();
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: REMINDER_TITLE, body: REMINDER_BODY },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
}

export async function cancelReminderAsync(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
