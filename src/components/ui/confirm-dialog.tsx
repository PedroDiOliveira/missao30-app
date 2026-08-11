import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /** Ausente = vira um alerta informativo, só com "Entendi". Presente
   * (junto com `onConfirm`) = vira uma confirmação de 2 ações. */
  confirmLabel?: string;
  onConfirm?: () => void;
  cancelLabel?: string;
}

/**
 * Substitui `Alert.alert()` — que no `react-native-web` é literalmente uma
 * função vazia (`static alert() {}`), então nunca aparece nada no
 * navegador, mesmo funcionando normalmente no app nativo. Reaproveita o
 * `AnimatedModal` já existente em vez de inventar outra coreografia.
 *
 * De propósito, a ação "arriscada" (`confirmLabel`) fica como um link
 * discreto abaixo do botão cheio de "cancelar" — mesma lógica já usada pro
 * link "Abandonar Missão" em si (CONTEXT.md Tela 3b: não incentivar a ação
 * destrutiva parecendo um botão primário).
 */
export function ConfirmDialog({
  visible,
  onClose,
  title,
  message,
  confirmLabel,
  onConfirm,
  cancelLabel = 'Cancelar',
}: ConfirmDialogProps) {
  const theme = useTheme();
  const isConfirm = Boolean(confirmLabel && onConfirm);

  function handleConfirm() {
    onConfirm?.();
    onClose();
  }

  return (
    <AnimatedModal visible={visible} onClose={onClose}>
      <ThemedText type="default" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
        {message}
      </ThemedText>

      {isConfirm ? (
        <View style={styles.actions}>
          <Pressable
            onPress={onClose}
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            accessibilityRole="button">
            <ThemedText type="smallBold" themeColor="textOnDark">
              {cancelLabel}
            </ThemedText>
          </Pressable>
          <Pressable onPress={handleConfirm} style={styles.linkButton} accessibilityRole="button">
            <ThemedText type="small" themeColor="textSecondary">
              {confirmLabel}
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={onClose}
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          accessibilityRole="button">
          <ThemedText type="smallBold" themeColor="textOnDark">
            Entendi
          </ThemedText>
        </Pressable>
      )}
    </AnimatedModal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  message: {
    lineHeight: 20,
  },
  actions: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  primaryButton: {
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
