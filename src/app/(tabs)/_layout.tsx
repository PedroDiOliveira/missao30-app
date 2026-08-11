import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
// Caminho interno do expo-router (não é uma subpath pública "oficial", mas
// é onde o pacote realmente define esse tipo hoje — só o tipo, sem runtime).
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import type { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing, TabBarHeight, TabBarSideInset } from '@/constants/theme';
import { UiIcons } from '@/lib/icons';

const TAB_ICONS: Record<string, LucideIcon> = {
  home: UiIcons.home,
  missions: UiIcons.catalog,
  profile: UiIcons.profile,
};

const TAB_LABELS: Record<string, string> = {
  home: 'Início',
  missions: 'Missões',
  profile: 'Perfil',
};

const ICON_SIZE = 28;
const ACTIVE_SCALE = 1.3;
const INACTIVE_STROKE_WIDTH = 2;
const ACTIVE_STROKE_WIDTH = 2.3;

interface TabBarItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
}

/** Um item da barra — isolado num componente próprio pra poder ter seus
 * próprios valores animados (o ícone cresce e a pílula de fundo entra/sai
 * suavemente quando a aba fica selecionada). */
function TabBarItem({ routeName, isFocused, onPress }: TabBarItemProps) {
  const Icon = TAB_ICONS[routeName] ?? UiIcons.home;
  const color = isFocused ? Colors.light.primary : Colors.light.textSecondary;

  const scale = useSharedValue(isFocused ? ACTIVE_SCALE : 1);
  const pillOpacity = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? ACTIVE_SCALE : 1, { damping: 14, stiffness: 220 });
    pillOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
  }, [isFocused, scale, pillOpacity]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const pillAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      // Web: react-native-web deixa um outline de foco no Pressable depois
      // do clique, que pode ser confundido com um efeito de hover — some
      // com ele explicitamente.
      style={({ pressed }) => [styles.item, styles.noWebOutline, pressed && styles.itemPressed]}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={TAB_LABELS[routeName] ?? routeName}>
      <View style={styles.iconWrap}>
        <Animated.View style={[styles.pill, pillAnimatedStyle]} />
        <Animated.View style={iconAnimatedStyle}>
          <Icon
            color={color}
            size={ICON_SIZE}
            strokeWidth={isFocused ? ACTIVE_STROKE_WIDTH : INACTIVE_STROKE_WIDTH}
          />
        </Animated.View>
      </View>
    </Pressable>
  );
}

/**
 * Barra de navegação totalmente customizada, em vez de tabBarIcon/
 * tabBarItemStyle nativos do Tabs — o layout padrão da lib reserva espaço
 * pro rótulo mesmo com tabBarShowLabel:false, o que descentralizava o
 * ícone verticalmente. Renderizando cada item aqui, o centro é garantido
 * (flex:1 + alignItems/justifyContent 'center' numa barra de altura fixa).
 */
function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { bottom: insets.bottom + Spacing.two }]}>
      <View style={StyleSheet.absoluteFill}>
        <BlurView tint="light" intensity={35} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.tint]} />
      </View>

      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        function onPress() {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return <TabBarItem key={route.key} routeName={route.name} isFocused={isFocused} onPress={onPress} />;
      })}
    </View>
  );
}

/** Navegação principal em abas — Início, Missões, Perfil. */
export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <GlassTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Início' }} />
      <Tabs.Screen name="missions" options={{ title: 'Missões' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: TabBarSideInset,
    right: TabBarSideInset,
    height: TabBarHeight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  tint: {
    backgroundColor: Colors.light.background,
    opacity: 0.12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemPressed: {
    opacity: 0.6,
  },
  noWebOutline: Platform.select({
    web: { outlineStyle: 'none' },
    default: {},
  }) as object,
  iconWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    // rgba de Colors.light.primary (#D2795A) a 15% — StyleSheet estático
    // não aceita opacidade calculada a partir de um hex em tempo real.
    backgroundColor: 'rgba(210, 121, 90, 0.15)',
  },
});
