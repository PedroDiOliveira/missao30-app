import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UiIcons } from '@/lib/icons';

interface CustomMissionTeaserModalProps {
  visible: boolean;
  onClose: () => void;
}

/** Modal-teaser aberto pelo `CustomMissionBanner` — explica o recurso
 * futuro (CONTEXT.md Log de Decisões #14), sem formulário nem cobrança
 * real. Comunica a proposta de valor paga, não só um "em breve" genérico. */
export function CustomMissionTeaserModal({ visible, onClose }: CustomMissionTeaserModalProps) {
  const theme = useTheme();

  return (
    <AnimatedModal visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <View style={[styles.iconBadge, { backgroundColor: theme.primary }]}>
          <UiIcons.lock size={22} color={theme.textOnDark} />
        </View>

        <View style={[styles.tag, { backgroundColor: theme.background }]}>
          <ThemedText type="smallBold" themeColor="primary" style={styles.tagLabel}>
            EM BREVE · PREMIUM
          </ThemedText>
        </View>

        <ThemedText type="default" style={styles.title}>
          Crie sua própria missão
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
          Em breve você vai poder montar uma missão de 30 dias do seu jeito: seu título, sua categoria, e quantas
          faltas você permite pra si mesmo. Esse recurso vai fazer parte de um plano pago do Missão30 — o catálogo
          atual continua liberado pra todo mundo.
        </ThemedText>
      </View>
    </AnimatedModal>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  tag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.sm,
  },
  tagLabel: {
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.one,
  },
});
