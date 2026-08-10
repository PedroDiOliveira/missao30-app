import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMissionsData } from '@/context/missions-context';

// Stub — Tela 2 do CONTEXT.md (catálogo de missões, filtros por categoria,
// modal de "Aceitar Missão"). Ainda não construída; só ganhou o aviso de
// limite atingido (CONTEXT.md Seção 5 — múltiplas missões ativas com teto).
export default function MissionsScreen() {
  const { activeMissions, maxActiveMissions } = useMissionsData();
  const atCap = activeMissions.length >= maxActiveMissions;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Catálogo</ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        Tela ainda não construída.
      </ThemedText>
      {atCap && (
        <ThemedText type="smallBold" themeColor="warning">
          Limite de {maxActiveMissions} missões simultâneas atingido — encerre uma missão ativa pra aceitar outra.
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
});
