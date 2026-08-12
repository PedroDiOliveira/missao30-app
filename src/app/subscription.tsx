import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppMark } from '@/components/ui/app-mark';
import { BackButton } from '@/components/ui/back-button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Radius, Spacing } from '@/constants/theme';
import { PREMIUM_MAX_ACTIVE_MISSIONS, PREMIUM_PRICE_LABEL, useSubscriptionTier } from '@/constants/subscription';
import { useTheme } from '@/hooks/use-theme';
import { MAX_ACTIVE_MISSIONS } from '@/constants/limits';
import { UiIcons } from '@/lib/icons';

const PLAN_LABEL: Record<'free' | 'premium', string> = {
  free: 'Grátis',
  premium: 'Premium',
};

const BENEFITS = [
  `Até ${PREMIUM_MAX_ACTIVE_MISSIONS} missões simultâneas (vs. ${MAX_ACTIVE_MISSIONS} no grátis)`,
  'Crie sua própria missão personalizada',
];

/**
 * Gestão de assinatura — novo atalho no card "Conta" do perfil. Lógica
 * mockada de propósito (`useSubscriptionTier()`, `constants/subscription.ts`):
 * sem provedor de pagamento escolhido, sem cobrança real. Os dois
 * benefícios listados reaproveitam promessas já plantadas em outros
 * lugares do app (limite de missões simultâneas e missão personalizada) em
 * vez de inventar propostas novas.
 */
export default function SubscriptionScreen() {
  const theme = useTheme();
  const tier = useSubscriptionTier();
  const [teaserVisible, setTeaserVisible] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <BackButton />

          <SurfaceCard variant="strong" style={styles.hero}>
            <AppMark size={40} onDark />
            <View style={[styles.tag, { backgroundColor: theme.primary }]}>
              <ThemedText type="smallBold" themeColor="textOnDark" style={styles.tagLabel}>
                PREMIUM
              </ThemedText>
            </View>
            <ThemedText type="title" themeColor="textOnDark" style={styles.heroTitle}>
              Leve o Missão30 além do grátis
            </ThemedText>
            <ThemedText type="small" themeColor="textOnDarkSecondary">
              Seu plano atual: {PLAN_LABEL[tier]}
            </ThemedText>
          </SurfaceCard>

          <SurfaceCard style={styles.benefitsCard}>
            <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
              O QUE O PREMIUM DESTRAVA
            </ThemedText>
            {BENEFITS.map((benefit) => (
              <View key={benefit} style={styles.benefitRow}>
                <UiIcons.check size={18} color={theme.success} />
                <ThemedText type="default" style={styles.benefitText}>
                  {benefit}
                </ThemedText>
              </View>
            ))}
          </SurfaceCard>

          <SurfaceCard style={styles.priceCard}>
            <ThemedText type="title" style={styles.price}>
              {PREMIUM_PRICE_LABEL}
            </ThemedText>
            <Pressable
              onPress={() => setTeaserVisible(true)}
              style={[styles.ctaButton, { backgroundColor: theme.primary }]}
              accessibilityRole="button">
              <ThemedText type="smallBold" themeColor="textOnDark">
                Assinar Premium
              </ThemedText>
            </Pressable>
          </SurfaceCard>
        </ScrollView>
      </SafeAreaView>

      <ConfirmDialog
        visible={teaserVisible}
        onClose={() => setTeaserVisible(false)}
        title="Em breve"
        message="A assinatura Premium ainda está em construção. Assim que estiver disponível, você vai poder assinar direto por aqui."
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    gap: Spacing.two,
    alignItems: 'flex-start',
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
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
    marginTop: Spacing.one,
  },
  benefitsCard: {
    gap: Spacing.three,
  },
  eyebrow: {
    letterSpacing: 0.5,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  benefitText: {
    flex: 1,
  },
  priceCard: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  price: {
    fontSize: 28,
    lineHeight: 34,
  },
  ctaButton: {
    alignSelf: 'stretch',
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
});
