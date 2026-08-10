/**
 * Tipos espelhando o schema do CONTEXT.md, Seção 5 (tabelas) e Seção 6/7
 * (retorno da RPC get_user_mission_state). Se o schema mudar, atualize aqui
 * e no CONTEXT.md juntos — não só um dos dois.
 */

export type MissionCategory = 'study' | 'fitness' | 'sleep' | 'finance';

export type UserMissionStatus = 'active' | 'completed' | 'failed' | 'abandoned';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  reminder_time: string; // 'HH:MM', local do usuário
  reminder_enabled: boolean;
  created_at: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  icon_name: string;
  duration_days: number;
  allowed_fails: number;
  is_published: boolean;
  created_at: string;
}

export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  start_date: string; // YYYY-MM-DD, data local do cliente
  duration_days: number; // snapshot de missions.duration_days no accept
  allowed_fails: number; // snapshot de missions.allowed_fails no accept
  status: UserMissionStatus;
  fails_count: number;
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_mission_id: string;
  check_in_date: string; // YYYY-MM-DD, data local do cliente
  created_at: string;
}

/** Espelha o retorno de get_user_mission_state() — CONTEXT.md Seção 6/7. */
export interface UserMissionState {
  status: UserMissionStatus;
  fails_count: number;
  day_number: number;
}

/**
 * Forma combinada que a tela Home consome — equivalente ao que um hook de
 * dados real montaria a partir de user_missions + missions + o RPC de
 * estado + check_ins. `null` representa "nenhuma missão ativa" (estado
 * vazio, CONTEXT.md Seção 7 — roteamento para /missions).
 */
export interface ActiveMissionView {
  userMission: UserMission;
  mission: Mission;
  state: UserMissionState;
  checkInDates: string[]; // check_ins.check_in_date desta missão, YYYY-MM-DD
}

export type DayCellState = 'completed' | 'missed' | 'current' | 'future';
