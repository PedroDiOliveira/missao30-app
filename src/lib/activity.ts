/**
 * Agregação de check-ins por dia — base pro gráfico de atividade anual
 * (estilo GitHub) no modal de compartilhar. Soma check-ins de todas as
 * missões (ativas + histórico); um dia com check-in em 2 missões conta
 * como intensidade 2, não dois dias separados.
 */

import { addDays, todayLocal } from '@/lib/date';
import type { UserMissionView } from '@/lib/types';

export interface DayCell {
  date: string; // YYYY-MM-DD
  count: number; // quantas missões tiveram check-in nesse dia
  isFuture: boolean; // dia depois de hoje, existe só pra completar a semana
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
 * Gera 53 semanas completas (domingo a sábado) terminando na semana atual —
 * mesma janela que o gráfico de contribuições do GitHub usa. Dias depois de
 * hoje (pra fechar a semana corrente) vêm marcados como `isFuture`.
 */
export function buildYearGrid(counts: Map<string, number>, today: string = todayLocal()): DayCell[][] {
  const todayDow = new Date(`${today}T00:00:00`).getDay(); // 0 = domingo
  const daysUntilWeekEnd = 6 - todayDow;
  const totalDays = 53 * 7;
  const startOffset = totalDays - 1 - daysUntilWeekEnd;

  const cells: DayCell[] = [];
  for (let i = -startOffset; i <= daysUntilWeekEnd; i++) {
    const date = addDays(today, i);
    cells.push({ date, count: counts.get(date) ?? 0, isFuture: i > 0 });
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
