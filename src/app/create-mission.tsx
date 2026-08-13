import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BackButton } from '@/components/ui/back-button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Radius, Spacing } from '@/constants/theme';
import { useMissionsData } from '@/context/missions-context';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORY_LABEL } from '@/lib/catalog';
import type { CadenceUnit, MissionCategory } from '@/lib/types';

const STEP_COUNT = 3;
const CATEGORIES: MissionCategory[] = ['study', 'fitness', 'sleep', 'finance'];
const WEEK_TARGET_OPTIONS = [2, 3, 4, 5, 6];

/**
 * Criação de missão personalizada, em 3 etapas (CONTEXT.md Log de
 * Decisões, novo item) — no máximo 2 campos por etapa, de propósito.
 * Estado das etapas é local (não sub-rotas): é um fluxo linear com dado
 * compartilhado, não 3 telas independentes. `allowed_fails` nunca vira
 * campo — é derivado da cadência dentro de `createCustomMission()`
 * (`missions-context.tsx`).
 */
export default function CreateMissionScreen() {
  const theme = useTheme();
  const { createCustomMission, acceptMission } = useMissionsData();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MissionCategory | null>(null);
  const [cadenceUnit, setCadenceUnit] = useState<CadenceUnit>('day');
  const [cadenceTarget, setCadenceTarget] = useState(3);
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Variável simples (não state) — só precisa sobreviver dentro da mesma
  // chamada de handleCreate, pra diferenciar "criação falhou" de "criou
  // mas não deu pra aceitar" no catch. onDismissError lê o valor mais
  // recente sem se preocupar com closure velha (é só .current).
  const missionCreatedRef = useRef(false);

  const canAdvanceStep1 = title.trim().length > 0 && category !== null;
  const canSubmit = description.trim().length > 0;

  function handleBack() {
    if (step === 1) {
      router.back();
      return;
    }
    setStep((s) => s - 1);
  }

  async function handleCreate() {
    if (!category) return;
    setError(null);
    setCreating(true);
    missionCreatedRef.current = false;
    try {
      const missionId = await createCustomMission({
        title: title.trim(),
        description: description.trim(),
        category,
        cadenceUnit,
        cadenceTarget: cadenceUnit === 'week' ? cadenceTarget : 1,
      });
      missionCreatedRef.current = true;
      // Cria já aceita direto — reaproveita a RPC de aceitar que já existe,
      // mesmo padrão de "aceitar leva direto pro detalhe" já usado no
      // modal do catálogo (`mission-detail-modal.tsx`).
      const userMissionId = await acceptMission(missionId);
      router.replace(`/mission/${userMissionId}`);
    } catch {
      setError(
        missionCreatedRef.current
          ? 'Sua missão foi criada! Não deu pra aceitar agora (você deve estar no limite de missões simultâneas) — ela já está em "Minhas Missões", no catálogo, pra aceitar quando quiser.'
          : 'Não foi possível criar a missão agora. Tente de novo em instantes.',
      );
    } finally {
      setCreating(false);
    }
  }

  function handleDismissError() {
    setError(null);
    if (missionCreatedRef.current) router.replace('/missions');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <BackButton />

          <View style={styles.progressRow}>
            {Array.from({ length: STEP_COUNT }, (_, i) => i + 1).map((s) => (
              <View key={s} style={[styles.progressSegment, { backgroundColor: s <= step ? theme.primary : theme.border }]} />
            ))}
          </View>

          {step === 1 && (
            <View style={styles.stepContent}>
              <ThemedText type="title" style={styles.stepTitle}>
                O que você quer conquistar?
              </ThemedText>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="ex.: Correr 3x por Semana"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              />
              <View style={styles.chipsRow}>
                {CATEGORIES.map((c) => {
                  const active = c === category;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => setCategory(c)}
                      style={[
                        styles.chip,
                        { backgroundColor: active ? theme.secondary : theme.backgroundElement, borderColor: active ? theme.secondary : theme.border },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}>
                      <ThemedText type="smallBold" themeColor={active ? 'textOnDark' : 'textSecondary'}>
                        {CATEGORY_LABEL[c]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <ThemedText type="title" style={styles.stepTitle}>
                Com que frequência?
              </ThemedText>
              <View style={styles.chipsRow}>
                <Pressable
                  onPress={() => setCadenceUnit('day')}
                  style={[
                    styles.chip,
                    { backgroundColor: cadenceUnit === 'day' ? theme.secondary : theme.backgroundElement, borderColor: cadenceUnit === 'day' ? theme.secondary : theme.border },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: cadenceUnit === 'day' }}>
                  <ThemedText type="smallBold" themeColor={cadenceUnit === 'day' ? 'textOnDark' : 'textSecondary'}>
                    Todo dia
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setCadenceUnit('week')}
                  style={[
                    styles.chip,
                    { backgroundColor: cadenceUnit === 'week' ? theme.secondary : theme.backgroundElement, borderColor: cadenceUnit === 'week' ? theme.secondary : theme.border },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: cadenceUnit === 'week' }}>
                  <ThemedText type="smallBold" themeColor={cadenceUnit === 'week' ? 'textOnDark' : 'textSecondary'}>
                    Algumas vezes na semana
                  </ThemedText>
                </Pressable>
              </View>

              {cadenceUnit === 'week' && (
                <View style={styles.chipsRow}>
                  {WEEK_TARGET_OPTIONS.map((n) => {
                    const active = n === cadenceTarget;
                    return (
                      <Pressable
                        key={n}
                        onPress={() => setCadenceTarget(n)}
                        style={[
                          styles.chip,
                          styles.chipSmall,
                          { backgroundColor: active ? theme.secondary : theme.backgroundElement, borderColor: active ? theme.secondary : theme.border },
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}>
                        <ThemedText type="smallBold" themeColor={active ? 'textOnDark' : 'textSecondary'}>
                          {n}x
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {step === 3 && category && (
            <View style={styles.stepContent}>
              <ThemedText type="title" style={styles.stepTitle}>
                Descreva em uma frase
              </ThemedText>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="ex.: Corra ao menos 20 minutos, no seu ritmo."
                placeholderTextColor={theme.textSecondary}
                multiline
                style={[styles.input, styles.textArea, { borderColor: theme.border, color: theme.text }]}
              />

              <SurfaceCard style={styles.previewCard}>
                <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
                  PRÉVIA
                </ThemedText>
                <ThemedText type="default" style={styles.previewTitle}>
                  {title}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {CATEGORY_LABEL[category]} · {cadenceUnit === 'day' ? 'Todo dia' : `${cadenceTarget}x por semana`}
                </ThemedText>
              </SurfaceCard>
            </View>
          )}

          <View style={styles.actionsRow}>
            <Pressable onPress={handleBack} style={styles.backLink} accessibilityRole="button">
              <ThemedText type="small" themeColor="textSecondary">
                Voltar
              </ThemedText>
            </Pressable>

            {step < STEP_COUNT ? (
              <Pressable
                onPress={() => setStep((s) => s + 1)}
                disabled={step === 1 && !canAdvanceStep1}
                style={[styles.primaryButton, { backgroundColor: theme.primary }, step === 1 && !canAdvanceStep1 && styles.disabled]}
                accessibilityRole="button">
                <ThemedText type="smallBold" themeColor="textOnDark">
                  Continuar
                </ThemedText>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleCreate}
                disabled={!canSubmit || creating}
                style={[styles.primaryButton, { backgroundColor: theme.primary }, (!canSubmit || creating) && styles.disabled]}
                accessibilityRole="button">
                <ThemedText type="smallBold" themeColor="textOnDark">
                  Criar Missão
                </ThemedText>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <ConfirmDialog visible={error !== null} onClose={handleDismissError} title="Ops" message={error ?? ''} />
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
    gap: Spacing.five,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepContent: {
    gap: Spacing.four,
  },
  stepTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  chipSmall: {
    paddingHorizontal: Spacing.three,
  },
  previewCard: {
    gap: Spacing.one,
  },
  eyebrow: {
    letterSpacing: 0.5,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backLink: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  primaryButton: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
