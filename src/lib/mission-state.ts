/**
 * Reimplementação pura em TS das fórmulas de get_user_mission_state()
 * (CONTEXT.md Seção 6/7) — "settle on read" do lado do cliente, enquanto o
 * backend real não existe. Isto NÃO é código descartável de mock: é a
 * referência que o SQL da RPC deve bater exatamente quando for escrita.
 *
 * `clientToday` é sempre a data local do dispositivo (YYYY-MM-DD), nunca
 * derivada de Date.now() em UTC — mesma regra do resto do app.
 */

import type { UserMission, UserMissionState, UserMissionStatus } from '@/lib/types';

function daysBetween(from: string, to: string): number {
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((toDate.getTime() - fromDate.getTime()) / msPerDay);
}

function addDaysToDate(base: string, n: number): string {
  const d = new Date(`${base}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

type MissionStateInput = Pick<
  UserMission,
  'start_date' | 'duration_days' | 'allowed_fails' | 'status' | 'fails_count'
>;

export function computeMissionState(
  userMission: MissionStateInput,
  checkInDates: string[],
  clientToday: string,
): UserMissionState {
  const dayNumber = clamp(daysBetween(userMission.start_date, clientToday) + 1, 1, userMission.duration_days);

  // Estado terminal: congelado, nunca recalculado (mesma regra da RPC).
  if (userMission.status !== 'active') {
    return { status: userMission.status, fails_count: userMission.fails_count, day_number: dayNumber };
  }

  const windowEndExclusive = addDaysToDate(userMission.start_date, userMission.duration_days);
  const passedDays = clamp(daysBetween(userMission.start_date, clientToday), 0, userMission.duration_days);

  let checkInsBeforeToday = 0;
  let totalCheckIns = 0;
  for (const date of new Set(checkInDates)) {
    if (date >= userMission.start_date && date < windowEndExclusive) {
      totalCheckIns += 1;
      if (date < clientToday) checkInsBeforeToday += 1;
    }
  }

  const fails = Math.max(passedDays - checkInsBeforeToday, 0);
  const windowClosed = clientToday >= windowEndExclusive;

  let status: UserMissionStatus;
  if (fails > userMission.allowed_fails) {
    status = 'failed';
  } else if (windowClosed || totalCheckIns === userMission.duration_days) {
    status = 'completed'; // comparecimento perfeito completa na hora
  } else {
    status = 'active';
  }

  return { status, fails_count: fails, day_number: dayNumber };
}
