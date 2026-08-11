import { useState } from 'react';
import { Linking, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';

const SUPPORT_EMAIL = 'suporte@missao30.app';

function handleDeleteRequest() {
  Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Solicitação de exclusão de conta')}`);
}

/** CONTEXT.md Decisão #7: exclusão de conta via e-mail de suporte, não
 * self-service ainda. Logout é um stub — não existe autenticação real. */
export function AccountCard() {
  const theme = useTheme();
  const [logoutInfoVisible, setLogoutInfoVisible] = useState(false);

  return (
    <SurfaceCard style={styles.card}>
      <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
        CONTA
      </ThemedText>

      <Pressable onPress={handleDeleteRequest} style={styles.row} accessibilityRole="button">
        <ThemedText type="default" style={styles.label}>
          Solicitar exclusão de conta
        </ThemedText>
        <UiIcons.chevronRight size={16} color={theme.textSecondary} />
      </Pressable>

      <Pressable onPress={() => setLogoutInfoVisible(true)} style={styles.row} accessibilityRole="button">
        <ThemedText type="default" themeColor="textSecondary" style={styles.label}>
          Sair
        </ThemedText>
      </Pressable>

      <ConfirmDialog
        visible={logoutInfoVisible}
        onClose={() => setLogoutInfoVisible(false)}
        title="Sair"
        message="Login e logout ainda não existem nesta fase do app — só a interface está pronta."
      />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  eyebrow: {
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
  },
});
