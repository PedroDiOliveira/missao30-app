/**
 * Camada de dados compartilhada entre o dashboard e a tela de detalhe —
 * existe porque as duas podem disparar um check-in, e cópias de useState
 * por tela dessincronizariam ao navegar entre elas. `allUserMissions` é a
 * única fonte de verdade; `activeMissions`/`missionHistory` são filtros
 * derivados, nunca arrays mantidos à parte (CONTEXT.md Seção 4/§7).
 *
 * Os mutadores (`checkIn`, `abandonMission`) já retornam Promise mesmo
 * operando sobre o mock — quando virarem chamadas reais às RPCs do
 * Supabase (accept_mission/create_check_in/abandon_mission, CONTEXT.md
 * Seção 6), as telas que os chamam não precisam mudar.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { MAX_ACTIVE_MISSIONS } from '@/constants/limits';
import { todayLocal } from '@/lib/date';
import { computeMissionState } from '@/lib/mission-state';
import { missionCatalog, initialUserMissions } from '@/lib/mock-data';
import type { SettlementNotice, UserMission, UserMissionStatus, UserMissionView } from '@/lib/types';

interface MissionsContextValue {
  allUserMissions: UserMissionView[];
  activeMissions: UserMissionView[];
  missionHistory: UserMissionView[];
  settlementNotices: SettlementNotice[];
  maxActiveMissions: number;
  getMissionById: (id: string) => UserMissionView | undefined;
  checkIn: (userMissionId: string) => Promise<void>;
  abandonMission: (userMissionId: string) => Promise<void>;
  acceptMission: (missionId: string) => Promise<string>;
  dismissNotice: (userMissionId: string) => void;
}

const MissionsContext = createContext<MissionsContextValue | null>(null);

function noticeFor(view: UserMissionView, newStatus: Exclude<UserMissionStatus, 'active'>): SettlementNotice {
  return {
    userMissionId: view.userMission.id,
    missionId: view.mission.id,
    missionTitle: view.mission.title,
    newStatus,
  };
}

/** Recalcula o estado de toda missão que ainda estava 'active', devolvendo
 * as linhas atualizadas + um SettlementNotice pra cada uma que virou
 * terminal nesta passada (CONTEXT.md Seção 7 — settle-on-read por-missão). */
function settleAll(missions: UserMissionView[], today: string) {
  const notices: SettlementNotice[] = [];
  const settled = missions.map((view) => {
    if (view.state.status !== 'active') return view;
    const newState = computeMissionState(view.userMission, view.checkInDates, today);
    if (newState.status !== 'active') notices.push(noticeFor(view, newState.status));
    return {
      ...view,
      userMission: { ...view.userMission, status: newState.status, fails_count: newState.fails_count },
      state: newState,
    };
  });
  return { missions: settled, notices };
}

export function MissionsProvider({ children }: { children: ReactNode }) {
  const [allUserMissions, setAllUserMissions] = useState<UserMissionView[]>(
    () => settleAll(initialUserMissions, todayLocal()).missions,
  );
  const [settlementNotices, setSettlementNotices] = useState<SettlementNotice[]>([]);

  const activeMissions = useMemo(
    () => allUserMissions.filter((m) => m.state.status === 'active'),
    [allUserMissions],
  );
  const missionHistory = useMemo(
    () => allUserMissions.filter((m) => m.state.status !== 'active'),
    [allUserMissions],
  );

  const getMissionById = useCallback(
    (id: string) => allUserMissions.find((m) => m.userMission.id === id),
    [allUserMissions],
  );

  const checkIn = useCallback(async (userMissionId: string) => {
    const today = todayLocal();
    let notice: SettlementNotice | null = null;

    setAllUserMissions((prev) =>
      prev.map((view) => {
        if (view.userMission.id !== userMissionId) return view;
        if (view.state.status !== 'active' || view.checkInDates.includes(today)) return view;

        const checkInDates = [...view.checkInDates, today];
        const newState = computeMissionState(view.userMission, checkInDates, today);
        if (newState.status !== 'active') notice = noticeFor(view, newState.status);

        return {
          ...view,
          checkInDates,
          userMission: { ...view.userMission, status: newState.status, fails_count: newState.fails_count },
          state: newState,
        };
      }),
    );

    if (notice) setSettlementNotices((prev) => [...prev, notice as SettlementNotice]);
  }, []);

  const abandonMission = useCallback(async (userMissionId: string) => {
    setAllUserMissions((prev) =>
      prev.map((view) => {
        if (view.userMission.id !== userMissionId || view.state.status !== 'active') return view;
        return {
          ...view,
          userMission: { ...view.userMission, status: 'abandoned' },
          state: { ...view.state, status: 'abandoned' },
        };
      }),
    );
  }, []);

  const dismissNotice = useCallback((userMissionId: string) => {
    setSettlementNotices((prev) => prev.filter((n) => n.userMissionId !== userMissionId));
  }, []);

  /** Espelha accept_mission() (CONTEXT.md Seção 6): checa a contagem de
   * ativas contra o limite antes de inserir. Mesma não-atomicidade já
   * documentada na Decisão #10 — a contagem lida aqui vem do closure
   * (activeMissions.length), não de um lock; aceitável pelos mesmos
   * motivos já registrados (baixa concorrência, 1 usuário/1 aparelho). */
  const acceptMission = useCallback(
    async (missionId: string): Promise<string> => {
      if (activeMissions.length >= MAX_ACTIVE_MISSIONS) {
        throw new Error(`active mission limit reached (${activeMissions.length}/${MAX_ACTIVE_MISSIONS})`);
      }

      const mission = missionCatalog.find((m) => m.id === missionId && m.is_published);
      if (!mission) throw new Error(`mission ${missionId} not found or not published`);

      const today = todayLocal();
      const newUserMission: UserMission = {
        id: `user-mission-${missionId}-${Date.now()}`,
        user_id: 'mock-user',
        mission_id: mission.id,
        start_date: today,
        duration_days: mission.duration_days,
        allowed_fails: mission.allowed_fails,
        status: 'active',
        fails_count: 0,
        created_at: today,
      };
      const newView: UserMissionView = {
        userMission: newUserMission,
        mission,
        state: { status: 'active', fails_count: 0, day_number: 1 },
        checkInDates: [],
      };

      setAllUserMissions((prev) => [...prev, newView]);
      return newUserMission.id;
    },
    [activeMissions.length],
  );

  const value = useMemo<MissionsContextValue>(
    () => ({
      allUserMissions,
      activeMissions,
      missionHistory,
      settlementNotices,
      maxActiveMissions: MAX_ACTIVE_MISSIONS,
      getMissionById,
      checkIn,
      abandonMission,
      acceptMission,
      dismissNotice,
    }),
    [
      allUserMissions,
      activeMissions,
      missionHistory,
      settlementNotices,
      getMissionById,
      checkIn,
      abandonMission,
      acceptMission,
      dismissNotice,
    ],
  );

  return <MissionsContext.Provider value={value}>{children}</MissionsContext.Provider>;
}

export function useMissionsData(): MissionsContextValue {
  const ctx = useContext(MissionsContext);
  if (!ctx) throw new Error('useMissionsData precisa ser usado dentro de <MissionsProvider>');
  return ctx;
}
