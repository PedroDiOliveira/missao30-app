/**
 * Reimplementação pura em TS das fórmulas de get_user_mission_state()
 * (CONTEXT.md Seção 6/7) — "settle on read" do lado do cliente. Precisa
 * bater byte a byte com a RPC SQL pra qualquer entrada; não é código
 * descartável de mock.
 *
 * `clientToday` é sempre a data local do dispositivo (YYYY-MM-DD), nunca
 * derivada de Date.now() em UTC — mesma regra do resto do app.
 */

import type { CadenceUnit, UserMission, UserMissionState, UserMissionStatus } from '@/lib/types';

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

// 0=domingo..6=sábado — bate numericamente com extract(dow from d) do
// Postgres (usado no mesmo cálculo do lado da RPC).
function weekday(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00`).getDay();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

type MissionStateInput = Pick<
  UserMission,
  'start_date' | 'duration_days' | 'allowed_fails' | 'status' | 'fails_count' | 'cadence_unit' | 'cadence_target'
>;

export interface WeekBucket {
  weekStart: string; // âncora de domingo, YYYY-MM-DD
  capacity: number; // 1-7, dias da missão que caem nessa semana
  target: number; // round(cadenceTarget * capacity / 7)
  checkIns: number;
  elapsed: boolean; // todo dia da semana dentro da janela já é < clientToday
  shortfall: boolean; // checkIns < target (independente de elapsed)
}

/**
 * Agrupa os dias de uma missão semanal em semanas dom-sáb — usado tanto
 * pra calcular faltas/conclusão em `computeMissionState()` quanto pelo
 * resumo semanal da UI (`WeeklyCadenceSummary`), pra nenhum dos dois
 * reimplementar o agrupamento por conta própria.
 */
export function computeWeekBuckets(
  startDate: string,
  durationDays: number,
  cadenceTarget: number,
  checkInDates: string[],
  clientToday: string,
): WeekBucket[] {
  const windowEndExclusive = addDaysToDate(startDate, durationDays);
  const lastDay = addDaysToDate(startDate, durationDays - 1);
  const firstWeekStart = addDaysToDate(startDate, -weekday(startDate));
  const lastWeekStart = addDaysToDate(lastDay, -weekday(lastDay));

  const checkInSet = new Set(checkInDates);
  const buckets: WeekBucket[] = [];

  let weekStart = firstWeekStart;
  while (weekStart <= lastWeekStart) {
    const bucketStart = weekStart < startDate ? startDate : weekStart;
    const weekEndExclusive = addDaysToDate(weekStart, 7);
    const bucketEnd = weekEndExclusive < windowEndExclusive ? weekEndExclusive : windowEndExclusive;
    const capacity = daysBetween(bucketStart, bucketEnd);
    // Proporcional à capacidade da semana — não min(target, capacidade),
    // que deixaria semanas de borda mais difíceis que semanas cheias.
    const target = Math.round((cadenceTarget * capacity) / 7);

    let checkIns = 0;
    for (const date of checkInSet) {
      if (date >= bucketStart && date < bucketEnd) checkIns += 1;
    }

    buckets.push({
      weekStart,
      capacity,
      target,
      checkIns,
      elapsed: bucketEnd <= clientToday,
      shortfall: checkIns < target,
    });

    weekStart = addDaysToDate(weekStart, 7);
  }

  return buckets;
}

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
  const windowClosed = clientToday >= windowEndExclusive;

  let fails: number;
  let completedEarly: boolean;

  const cadenceUnit: CadenceUnit = userMission.cadence_unit;
  if (cadenceUnit === 'day') {
    // Branch intocado: idêntico à fórmula original, garante zero
    // regressão pra toda missão diária existente.
    const passedDays = clamp(daysBetween(userMission.start_date, clientToday), 0, userMission.duration_days);

    let checkInsBeforeToday = 0;
    let totalCheckIns = 0;
    for (const date of new Set(checkInDates)) {
      if (date >= userMission.start_date && date < windowEndExclusive) {
        totalCheckIns += 1;
        if (date < clientToday) checkInsBeforeToday += 1;
      }
    }

    fails = Math.max(passedDays - checkInsBeforeToday, 0);
    completedEarly = totalCheckIns === userMission.duration_days;
  } else {
    const buckets = computeWeekBuckets(
      userMission.start_date,
      userMission.duration_days,
      userMission.cadence_target,
      checkInDates,
      clientToday,
    );
    fails = buckets.filter((b) => b.elapsed && b.shortfall).length;
    // Sem gate de "elapsed" aqui de propósito: toda semana (mesmo a ainda
    // em andamento) já bateu a própria meta — equivalente semanal do
    // comparecimento perfeito do branch diário. NÃO é comparar a soma
    // total de check-ins contra a soma das metas (permitiria uma semana
    // zerada ser "compensada" por excesso em outra).
    completedEarly = buckets.every((b) => !b.shortfall);
  }

  let status: UserMissionStatus;
  if (fails > userMission.allowed_fails) {
    status = 'failed';
  } else if (windowClosed || completedEarly) {
    status = 'completed'; // comparecimento perfeito completa na hora
  } else {
    status = 'active';
  }

  return { status, fails_count: fails, day_number: dayNumber };
}
