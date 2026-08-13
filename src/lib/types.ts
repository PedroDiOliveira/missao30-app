/**
 * Tipos espelhando o schema do CONTEXT.md, Seção 5 (tabelas) e Seção 6/7
 * (retorno da RPC get_user_mission_state). Se o schema mudar, atualize aqui
 * e no CONTEXT.md juntos — não só um dos dois.
 */

export type MissionCategory = 'study' | 'fitness' | 'sleep' | 'finance';

export type UserMissionStatus = 'active' | 'completed' | 'failed' | 'abandoned';

/** 'day' = 1 check-in por dia (comportamento original); 'week' = meta de N
 * check-ins em qualquer dia da semana dom-sáb. `cadence_target` é sempre 1
 * quando 'day'; entre 1 e 7 quando 'week'. */
export type CadenceUnit = 'day' | 'week';

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
  allowed_fails: number; // unidade depende de cadence_unit — ver CadenceUnit
  cadence_unit: CadenceUnit;
  cadence_target: number;
  is_published: boolean;
  // null = curada (seed/admin); presente = criada pelo próprio usuário via
  // /create-mission — nunca publicada pro catálogo geral (RLS garante que
  // só aparece pra quem criou).
  created_by: string | null;
  created_at: string;
}

export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  start_date: string; // YYYY-MM-DD, data local do cliente
  duration_days: number; // snapshot de missions.duration_days no accept
  allowed_fails: number; // snapshot de missions.allowed_fails no accept
  cadence_unit: CadenceUnit; // snapshot de missions.cadence_unit no accept
  cadence_target: number; // snapshot de missions.cadence_target no accept
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
 * Forma combinada que as telas consomem — equivalente ao que um hook de
 * dados real montaria a partir de user_missions + missions + o RPC de
 * estado + check_ins. Não é "só de missões ativas": é uma linha de
 * user_mission (ativa OU do histórico) já unida com seu catálogo e estado
 * calculado — igualmente válida pra uma missão em andamento quanto pra uma
 * já concluída/falha/abandonada.
 */
export interface UserMissionView {
  userMission: UserMission;
  mission: Mission;
  state: UserMissionState;
  checkInDates: string[]; // check_ins.check_in_date desta missão, YYYY-MM-DD
}

/**
 * Aviso de que uma missão, entre possivelmente várias ativas, acabou de
 * assentar como terminal (CONTEXT.md Seção 7 — settle-on-read por-missão).
 */
export interface SettlementNotice {
  userMissionId: string;
  missionId: string;
  missionTitle: string;
  newStatus: Exclude<UserMissionStatus, 'active'>;
}

// 'rest' = dia passado sem check-in numa missão de cadência semanal — nunca
// é individualmente marcado como falta (a falta é por semana, não por dia
// específico); visualmente neutro, igual 'future'.
export type DayCellState = 'completed' | 'missed' | 'current' | 'future' | 'rest';
