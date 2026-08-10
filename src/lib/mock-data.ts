/**
 * Dados fake pra construir o front sem o Supabase rodando ainda. O formato
 * segue exatamente os tipos de `types.ts` (que por sua vez espelham o
 * schema do CONTEXT.md) — quando o backend entrar de verdade, só se troca
 * de onde `allUserMissions` vem (deste arquivo pra uma query real), as
 * telas não mudam.
 *
 * Troque ACTIVE_SCENARIO abaixo pra visualizar cada estado do dashboard.
 */

import { addDays, daysAgo } from '@/lib/date';
import { computeMissionState } from '@/lib/mission-state';
import type { Mission, UserMission, UserMissionView } from '@/lib/types';

export type MockScenario = 'empty' | 'single_active' | 'multiple_active' | 'at_cap';

export const ACTIVE_SCENARIO: MockScenario = 'multiple_active';

// -- catálogo completo (CONTEXT.md Seção 12) ------------------------------
export const missionCatalog: Mission[] = [
  {
    id: 'mission-study-1h',
    title: 'Estudar 1 Hora por Dia',
    description: 'Separe 60 minutos focados para estudar o que importa pra você, todos os dias.',
    category: 'study',
    icon_name: 'book-open',
    duration_days: 30,
    allowed_fails: 3,
    is_published: true,
    created_at: daysAgo(120),
  },
  {
    id: 'mission-study-read20',
    title: 'Ler 20 Páginas por Dia',
    description: 'Construa o hábito da leitura, 20 páginas de cada vez.',
    category: 'study',
    icon_name: 'book',
    duration_days: 30,
    allowed_fails: 3,
    is_published: true,
    created_at: daysAgo(120),
  },
  {
    id: 'mission-fitness-30min',
    title: 'Treinar 30 Minutos por Dia',
    description: 'Movimente o corpo por meia hora, todo santo dia.',
    category: 'fitness',
    icon_name: 'dumbbell',
    duration_days: 30,
    allowed_fails: 3,
    is_published: true,
    created_at: daysAgo(120),
  },
  {
    id: 'mission-fitness-10k-steps',
    title: '10 Mil Passos por Dia',
    description: 'Caminhe até bater 10.000 passos, no seu ritmo.',
    category: 'fitness',
    icon_name: 'footprints',
    duration_days: 30,
    allowed_fails: 3,
    is_published: true,
    created_at: daysAgo(120),
  },
  {
    id: 'mission-sleep-23h',
    title: 'Dormir Antes das 23h',
    description: 'Durma cedo e acorde com mais energia.',
    category: 'sleep',
    icon_name: 'moon',
    duration_days: 30,
    allowed_fails: 3,
    is_published: true,
    created_at: daysAgo(120),
  },
  {
    id: 'mission-sleep-no-screens',
    title: 'Sem Telas Antes de Dormir',
    description: 'Desligue as telas 30 minutos antes de deitar.',
    category: 'sleep',
    // 'smartphone-off' não existe no Lucide — corrigido pra 'monitor-off',
    // que cobre melhor o conceito de "tela" em geral (CONTEXT.md Seção 12).
    icon_name: 'monitor-off',
    duration_days: 30,
    allowed_fails: 3,
    is_published: true,
    created_at: daysAgo(120),
  },
  {
    id: 'mission-finance-track',
    title: 'Registrar Todos os Gastos',
    description: 'Anote cada real que sai do seu bolso, sem exceção.',
    category: 'finance',
    icon_name: 'wallet',
    duration_days: 30,
    allowed_fails: 3,
    is_published: true,
    created_at: daysAgo(120),
  },
  {
    id: 'mission-finance-no-impulse',
    title: 'Sem Gastos Supérfluos',
    description: 'Um mês inteiro sem compras por impulso.',
    category: 'finance',
    icon_name: 'piggy-bank',
    duration_days: 30,
    allowed_fails: 3,
    is_published: true,
    created_at: daysAgo(120),
  },
];

function catalogMission(id: string): Mission {
  const mission = missionCatalog.find((m) => m.id === id);
  if (!mission) throw new Error(`mock: missão de catálogo não encontrada: ${id}`);
  return mission;
}

// -- helper: monta uma missão ATIVA a partir de dias decorridos + faltas --
function buildActiveUserMissionView(
  idSuffix: string,
  missionId: string,
  startDaysAgo: number,
  missedDayIndexes: number[], // 1-indexado, dias que ficaram sem check-in
): UserMissionView {
  const mission = catalogMission(missionId);
  const startDate = daysAgo(startDaysAgo);
  const checkInDates: string[] = [];
  for (let day = 1; day <= startDaysAgo; day++) {
    if (!missedDayIndexes.includes(day)) checkInDates.push(addDays(startDate, day - 1));
  }

  const userMission: UserMission = {
    id: `user-mission-${idSuffix}`,
    user_id: 'mock-user',
    mission_id: mission.id,
    start_date: startDate,
    duration_days: mission.duration_days,
    allowed_fails: mission.allowed_fails,
    status: 'active',
    fails_count: 0, // recalculado abaixo via computeMissionState
    created_at: startDate,
  };

  const today = new Date().toLocaleDateString('en-CA');
  const state = computeMissionState(userMission, checkInDates, today);

  return {
    userMission: { ...userMission, status: state.status, fails_count: state.fails_count },
    mission,
    state,
    checkInDates,
  };
}

// -- helper: monta uma missão do HISTÓRICO (terminal, estado congelado) --
function buildHistoryUserMissionView(
  idSuffix: string,
  missionId: string,
  startDaysAgo: number,
  daysRun: number, // quantos dias a missão durou até assentar
  failsCount: number,
  status: 'completed' | 'failed' | 'abandoned',
): UserMissionView {
  const mission = catalogMission(missionId);
  const startDate = daysAgo(startDaysAgo);
  const checkInDates: string[] = [];
  for (let day = 1; day <= daysRun; day++) {
    // simula faltas espalhadas nos primeiros dias, sem sobrepor o total
    if (day > failsCount) checkInDates.push(addDays(startDate, day - 1));
  }

  const userMission: UserMission = {
    id: `user-mission-${idSuffix}`,
    user_id: 'mock-user',
    mission_id: mission.id,
    start_date: startDate,
    duration_days: mission.duration_days,
    allowed_fails: mission.allowed_fails,
    status,
    fails_count: failsCount,
    created_at: startDate,
  };

  return {
    userMission,
    mission,
    state: { status, fails_count: failsCount, day_number: Math.min(daysRun, mission.duration_days) },
    checkInDates,
  };
}

// -- histórico compartilhado pelos cenários não-vazios ---------------------
const sharedHistory: UserMissionView[] = [
  buildHistoryUserMissionView('h1', 'mission-fitness-10k-steps', 60, 30, 2, 'completed'),
  buildHistoryUserMissionView('h2', 'mission-study-read20', 90, 10, 4, 'failed'),
  buildHistoryUserMissionView('h3', 'mission-finance-no-impulse', 45, 5, 0, 'abandoned'),
];

// -- cenários ---------------------------------------------------------------
const scenarios: Record<MockScenario, UserMissionView[]> = {
  empty: [],

  single_active: [
    // "Dia 12 de 30", 1 falta (dia 5), check-in de hoje pendente
    buildActiveUserMissionView('1', 'mission-fitness-30min', 11, [5]),
    ...sharedHistory,
  ],

  multiple_active: [
    buildActiveUserMissionView('1', 'mission-fitness-30min', 11, [5]),
    // "Dia 5 de 30", 0 faltas ainda
    buildActiveUserMissionView('2', 'mission-sleep-23h', 4, []),
    ...sharedHistory,
  ],

  at_cap: [
    buildActiveUserMissionView('1', 'mission-fitness-30min', 11, [5]),
    buildActiveUserMissionView('2', 'mission-sleep-23h', 4, []),
    // "Dia 3 de 30", 1 falta (dia 2) — terceira e última vaga do limite mock
    buildActiveUserMissionView('3', 'mission-study-1h', 2, [2]),
    ...sharedHistory,
  ],
};

/** O que a camada de dados (MissionsProvider) carregaria de get_user_mission_state() + join. */
export const initialUserMissions: UserMissionView[] = scenarios[ACTIVE_SCENARIO];
