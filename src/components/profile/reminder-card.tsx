import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const PRESET_TIMES = ['08:00', '12:00', '18:00', '20:00', '22:00'];

interface ReminderCardProps {
  reminderTime: string;
  reminderEnabled: boolean;
  onChangeTime: (time: string) => void;
  onToggleEnabled: (enabled: boolean) => void;
}

/** Horário do lembrete diário (CONTEXT.md Seção 8, Tela 6) — só a interface
 * nesta rodada: atualiza o perfil mockado, mas não agenda notificação de
 * verdade ainda (isso precisa de `expo-notifications` + fluxo de permissão,
 * fora do escopo desta rodada). Chips de horário pré-definidos em vez de um
 * picker nativo, pra não precisar de uma dependência nova só pra isso. */
export function ReminderCard({ reminderTime, reminderEnabled, onChangeTime, onToggleEnabled }: ReminderCardProps) {
  const theme = useTheme();

  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.headerRow}>
        <ThemedText type="smallBold" themeColor="secondary" style={styles.eyebrow}>
          LEMBRETE DIÁRIO
        </ThemedText>
        <Switch
          value={reminderEnabled}
          onValueChange={onToggleEnabled}
          trackColor={{ false: theme.border, true: theme.secondary }}
          thumbColor={theme.backgroundElement}
        />
      </View>

      {reminderEnabled && (
        <View style={styles.chipsRow}>
          {PRESET_TIMES.map((time) => {
            const active = time === reminderTime;
            return (
              <Pressable
                key={time}
                onPress={() => onChangeTime(time)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? theme.secondary : theme.background,
                    borderColor: active ? theme.secondary : theme.border,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}>
                <ThemedText type="smallBold" themeColor={active ? 'textOnDark' : 'textSecondary'}>
                  {time}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      )}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    letterSpacing: 0.5,
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
});
