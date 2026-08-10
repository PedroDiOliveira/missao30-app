import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// Stub — Tela 4 do CONTEXT.md (relatório final: check-ins, faltas, %
// aproveitamento, mensagem de conclusão). Card de compartilhamento (Tela 5
// original) fica fora do MVP — Decisão #3 do log de decisões.
export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Relatório</ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        Tela ainda não construída. user_mission_id: {id}
      </ThemedText>
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
