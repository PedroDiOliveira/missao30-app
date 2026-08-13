/**
 * Camada de dados compartilhada entre o dashboard e a tela de detalhe —
 * fala direto com o Supabase (CONTEXT.md Log de Decisões #19). Existe
 * porque várias telas podem disparar um check-in, e cópias de useState por
 * tela dessincronizariam ao navegar entre elas. `allUserMissions` é a
 * única fonte de verdade; `activeMissions`/`missionHistory` são filtros
 * derivados, nunca arrays mantidos à parte.
 *
 * `checkIn`/`abandonMission`/`acceptMission` mantêm exatamente a mesma
 * assinatura que tinham na fase mock — nenhuma tela que já as chama
 * precisa mudar como as chama.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useMaxActiveMissions } from '@/constants/limits';
import { useAuth } from '@/context/auth-context';
import { CATEGORY_DEFAULT_ICON } from '@/lib/catalog';
import { todayLocal } from '@/lib/date';
import { computeMissionState } from '@/lib/mission-state';
import { supabase } from '@/lib/supabase';
import type {
  CadenceUnit,
  Mission,
  MissionCategory,
  SettlementNotice,
  UserMission,
  UserMissionState,
  UserMissionView,
} from '@/lib/types';

export interface CreateCustomMissionInput {
  title: string;
  description: string;
  category: MissionCategory;
  cadenceUnit: CadenceUnit;
  cadenceTarget: number;
}

interface MissionsContextValue {
  missionCatalog: Mission[];
  allUserMissions: UserMissionView[];
  activeMissions: UserMissionView[];
  missionHistory: UserMissionView[];
  settlementNotices: SettlementNotice[];
  maxActiveMissions: number;
  loading: boolean;
  getMissionById: (id: string) => UserMissionView | undefined;
  checkIn: (userMissionId: string) => Promise<void>;
  abandonMission: (userMissionId: string) => Promise<void>;
  acceptMission: (missionId: string) => Promise<string>;
  createCustomMission: (input: CreateCustomMissionInput) => Promise<string>;
  dismissNotice: (userMissionId: string) => void;
}

const MissionsContext = createContext<MissionsContextValue | null>(null);

// Forma bruta que a query embutida (user_missions + missions + check_ins)
// devolve — sem geração automática de tipos do schema (CONTEXT.md segue o
// padrão de espelhar o schema manualmente em lib/types.ts), então isso é
// tipado à mão, igual ao resto do projeto.
interface UserMissionRow {
  id: string;
  user_id: string;
  mission_id: string;
  start_date: string;
  duration_days: number;
  allowed_fails: number;
  cadence_unit: UserMission['cadence_unit'];
  cadence_target: number;
  status: UserMission['status'];
  fails_count: number;
  created_at: string;
  mission: Mission;
  check_ins: { check_in_date: string }[];
}

export function MissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const maxActiveMissions = useMaxActiveMissions();
  const [missionCatalog, setMissionCatalog] = useState<Mission[]>([]);
  const [allUserMissions, setAllUserMissions] = useState<UserMissionView[]>([]);
  const [settlementNotices, setSettlementNotices] = useState<SettlementNotice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) {
      setMissionCatalog([]);
      setAllUserMissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const today = todayLocal();

      const [{ data: catalogRows }, { data: rows }] = await Promise.all([
        supabase.from('missions').select('*').order('created_at'),
        supabase
          .from('user_missions')
          .select('*, mission:missions(*), check_ins(check_in_date)')
          .eq('user_id', user.id)
          .returns<UserMissionRow[]>(),
      ]);

      setMissionCatalog(catalogRows ?? []);

      const notices: SettlementNotice[] = [];
      const views: UserMissionView[] = [];

      for (const row of rows ?? []) {
        const checkInDates = row.check_ins.map((c) => c.check_in_date);
        let state = computeMissionState(row, checkInDates, today);

        // Só chama a RPC de verdade (persiste no banco + gera o aviso)
        // quando o cálculo local (mesma fórmula da RPC, já validada)
        // indica que uma missão que estava ativa virou terminal agora —
        // evita um round-trip por missão em toda leitura.
        if (row.status === 'active' && state.status !== 'active') {
          const { data: settled } = await supabase.rpc('get_user_mission_state', {
            p_user_mission_id: row.id,
            p_client_today: today,
          });
          const result = (settled as UserMissionState[] | null)?.[0];
          if (result && result.status !== 'active') {
            state = result;
            notices.push({
              userMissionId: row.id,
              missionId: row.mission.id,
              missionTitle: row.mission.title,
              newStatus: result.status,
            });
          }
        }

        const userMission: UserMission = {
          id: row.id,
          user_id: row.user_id,
          mission_id: row.mission_id,
          start_date: row.start_date,
          duration_days: row.duration_days,
          allowed_fails: row.allowed_fails,
          cadence_unit: row.cadence_unit,
          cadence_target: row.cadence_target,
          status: state.status,
          fails_count: state.fails_count,
          created_at: row.created_at,
        };

        views.push({ userMission, mission: row.mission, state, checkInDates });
      }

      setAllUserMissions(views);
      if (notices.length > 0) setSettlementNotices((prev) => [...prev, ...notices]);
    } catch (err) {
      console.error('Falha ao carregar dados de missões:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // `loadData` seta estado sincronamente logo no início (loading/guard de
    // usuário nulo) — despachar via microtask evita que o efeito em si
    // chame setState de forma direta/síncrona (react-hooks/set-state-in-effect),
    // sem mudar a reatividade (ainda roda de novo sempre que `user` muda).
    Promise.resolve().then(() => loadData());
  }, [loadData]);

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

  const checkIn = useCallback(
    async (userMissionId: string) => {
      const { error } = await supabase.rpc('create_check_in', {
        p_user_mission_id: userMissionId,
        p_check_in_date: todayLocal(),
      });
      if (error) throw error;
      await loadData();
    },
    [loadData],
  );

  const abandonMission = useCallback(
    async (userMissionId: string) => {
      const { error } = await supabase.rpc('abandon_mission', { p_user_mission_id: userMissionId });
      if (error) throw error;
      await loadData();
    },
    [loadData],
  );

  const acceptMission = useCallback(
    async (missionId: string): Promise<string> => {
      const { data, error } = await supabase.rpc('accept_mission', {
        p_mission_id: missionId,
        p_client_today: todayLocal(),
      });
      if (error) throw error;
      await loadData();
      return (data as UserMission).id;
    },
    [loadData],
  );

  const createCustomMission = useCallback(
    async (input: CreateCustomMissionInput): Promise<string> => {
      if (!user) throw new Error('Sem usuário autenticado');
      // allowed_fails derivado da cadência (não é campo do formulário) —
      // mesma calibração da Decisão #23: ~1 semana de tolerância pra
      // cadência semanal, ~3 dias pra diária.
      const allowedFails = input.cadenceUnit === 'week' ? 1 : 3;

      const { data, error } = await supabase
        .from('missions')
        .insert({
          title: input.title,
          description: input.description,
          category: input.category,
          icon_name: CATEGORY_DEFAULT_ICON[input.category],
          cadence_unit: input.cadenceUnit,
          cadence_target: input.cadenceTarget,
          allowed_fails: allowedFails,
          created_by: user.id,
          is_published: false,
        })
        .select()
        .single();
      if (error) throw error;
      await loadData();
      return (data as Mission).id;
    },
    [user, loadData],
  );

  const dismissNotice = useCallback((userMissionId: string) => {
    setSettlementNotices((prev) => prev.filter((n) => n.userMissionId !== userMissionId));
  }, []);

  const value = useMemo<MissionsContextValue>(
    () => ({
      missionCatalog,
      allUserMissions,
      activeMissions,
      missionHistory,
      settlementNotices,
      maxActiveMissions,
      loading,
      getMissionById,
      checkIn,
      abandonMission,
      acceptMission,
      createCustomMission,
      dismissNotice,
    }),
    [
      missionCatalog,
      allUserMissions,
      activeMissions,
      missionHistory,
      settlementNotices,
      maxActiveMissions,
      loading,
      getMissionById,
      checkIn,
      abandonMission,
      acceptMission,
      createCustomMission,
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
