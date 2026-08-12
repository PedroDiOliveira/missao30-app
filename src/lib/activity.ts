/**
 * Agregação de check-ins por dia — base pro gráfico de atividade anual
 * (estilo GitHub) no modal de compartilhar. Soma check-ins de todas as
 * missões (ativas + histórico); um dia com check-in em 2 missões conta
 * como intensidade 2, não dois dias separados.
 */

import { toLocalDateString } from '@/lib/date';
import type { UserMissionView } from '@/lib/types';

export interface DayCell {
  date: string; // YYYY-MM-DD
  count: number; // quantas missões tiveram check-in nesse dia
  inYear: boolean; // false = dia de preenchimento só pra fechar a semana (dez/jan vizinhos)
}

export function buildCheckInCountsByDate(
  activeMissions: UserMissionView[],
  missionHistory: UserMissionView[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const view of [...activeMissions, ...missionHistory]) {
    for (const date of view.checkInDates) {
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }
  }
  return counts;
}

/**
 * Gera o ano-calendário completo (1º de janeiro a 31 de dezembro de `year`)
 * em semanas inteiras (domingo a sábado) — sempre o ano inteiro, não uma
 * janela rolante de 365 dias. Os dias de dezembro/janeiro vizinhos que
 * sobram pra fechar a primeira/última semana vêm marcados `inYear: false`.
 */
export function buildCalendarYearGrid(counts: Map<string, number>, year: number): DayCell[][] {
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);

  const start = new Date(jan1);
  start.setDate(start.getDate() - jan1.getDay());

  const end = new Date(dec31);
  end.setDate(end.getDate() + (6 - dec31.getDay()));

  const cells: DayCell[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    cells.push({
      date: toLocalDateString(cursor),
      count: counts.get(toLocalDateString(cursor)) ?? 0,
      inYear: cursor.getFullYear() === year,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function countActiveDays(weeks: DayCell[][]): number {
  return weeks.flat().filter((day) => day.inYear && day.count > 0).length;
}
