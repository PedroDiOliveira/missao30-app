/**
 * Dados fake para construir o front sem o Supabase rodando ainda. O formato
 * segue exatamente os tipos de `types.ts` (que por sua vez espelham o
 * schema do CONTEXT.md) — quando o backend entrar de verdade, só se troca
 * de onde `ActiveMissionView` vem (deste arquivo para a RPC
 * get_user_mission_state), as telas não mudam.
 *
 * Troque ACTIVE_SCENARIO abaixo para visualizar cada estado da Home.
 */

import type { ActiveMissionView, CheckIn, Mission, UserMission } from '@/lib/types';

export type MockScenario = 'in_progress' | 'completed' | 'none';

export const ACTIVE_SCENARIO: MockScenario = 'in_progress';

// -- helpers de data locais, mesma convenção do CONTEXT.md (Seção 7): -----
// sempre YYYY-MM-DD relativo à data local do dispositivo, nunca UTC bruto.
function toLocalDateString(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalDateString(d);
}

function addDays(base: string, n: number): string {
  const d = new Date(`${base}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toLocalDateString(d);
}

// -- catálogo mínimo (subset do seed real, CONTEXT.md Seção 12) ----------
const mockMissionFitness: Mission = {
  id: 'mission-fitness-30min',
  title: 'Treinar 30 Minutos por Dia',
  description: 'Movimente o corpo por meia hora, todo santo dia.',
  category: 'fitness',
  icon_name: 'dumbbell',
  duration_days: 30,
  allowed_fails: 3,
  is_published: true,
  created_at: daysAgo(60),
};

const mockMissionSleep: Mission = {
  id: 'mission-sleep-23h',
  title: 'Dormir Antes das 23h',
  description: 'Durma cedo e acorde com mais energia.',
  category: 'sleep',
  icon_name: 'moon',
  duration_days: 30,
  allowed_fails: 3,
  is_published: true,
  created_at: daysAgo(60),
};

// -- cenário 1: missão em andamento, "Dia 12 de 30", 1 falta usada -------
// day_number = (hoje - start_date + 1) = 12  =>  start_date = hoje - 11
// dias decorridos (excluindo hoje) = 11; 1 falta => 10 check-ins antes de
// hoje; falta caiu no dia 5. Hoje (dia 12) ainda sem check-in — testa o
// botão no estado "pendente".
const scenario1Start = daysAgo(11);
const scenario1MissedDayIndex = 5; // 1-indexado
const scenario1CheckIns: CheckIn[] = Array.from({ length: 11 }, (_, i) => i + 1)
  .filter((day) => day !== scenario1MissedDayIndex)
  .map((day, idx) => ({
    id: `checkin-1-${idx}`,
    user_mission_id: 'user-mission-1',
    check_in_date: addDays(scenario1Start, day - 1),
    created_at: addDays(scenario1Start, day - 1),
  }));

const scenario1UserMission: UserMission = {
  id: 'user-mission-1',
  user_id: 'mock-user',
  mission_id: mockMissionFitness.id,
  start_date: scenario1Start,
  duration_days: 30,
  allowed_fails: 3,
  status: 'active',
  fails_count: 1,
  created_at: scenario1Start,
};

const inProgress: ActiveMissionView = {
  userMission: scenario1UserMission,
  mission: mockMissionFitness,
  state: { status: 'active', fails_count: 1, day_number: 12 },
  checkInDates: scenario1CheckIns.map((c) => c.check_in_date),
};

// -- cenário 2: missão concluída, 28/30 check-ins (2 faltas, dentro do
// limite de 3), janela de 30 dias já fechada ------------------------------
const scenario2Start = daysAgo(31);
const scenario2MissedDays = [10, 20]; // 1-indexado
const scenario2CheckIns: CheckIn[] = Array.from({ length: 30 }, (_, i) => i + 1)
  .filter((day) => !scenario2MissedDays.includes(day))
  .map((day, idx) => ({
    id: `checkin-2-${idx}`,
    user_mission_id: 'user-mission-2',
    check_in_date: addDays(scenario2Start, day - 1),
    created_at: addDays(scenario2Start, day - 1),
  }));

const scenario2UserMission: UserMission = {
  id: 'user-mission-2',
  user_id: 'mock-user',
  mission_id: mockMissionSleep.id,
  start_date: scenario2Start,
  duration_days: 30,
  allowed_fails: 3,
  status: 'completed',
  fails_count: 2,
  created_at: scenario2Start,
};

const completed: ActiveMissionView = {
  userMission: scenario2UserMission,
  mission: mockMissionSleep,
  state: { status: 'completed', fails_count: 2, day_number: 30 },
  checkInDates: scenario2CheckIns.map((c) => c.check_in_date),
};

const scenarios: Record<MockScenario, ActiveMissionView | null> = {
  in_progress: inProgress,
  completed,
  none: null,
};

/** O que a tela Home consumiria de get_user_mission_state() + join. */
export const activeMissionMock = scenarios[ACTIVE_SCENARIO];
