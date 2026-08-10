import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing, TabBarHeight, TabBarSideInset } from '@/constants/theme';
import { UiIcons } from '@/lib/icons';

/**
 * Navegação principal em abas — Início, Missões, Perfil. Barra flutuante
 * com efeito de vidro (BlurView + um tingimento na cor de fundo do app,
 * já que o blur puro fica frio/genérico demais sobre a paleta creme).
 * `position: 'absolute'` faz o conteúdo das telas rolar por baixo; cada
 * tela dentro deste grupo reserva espaço no rodapé com
 * `TabBarClearance` (src/constants/theme.ts) pra não ficar encoberta.
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: {
          position: 'absolute',
          left: TabBarSideInset,
          right: TabBarSideInset,
          bottom: insets.bottom + Spacing.two,
          height: TabBarHeight,
          borderRadius: Radius.lg,
          borderWidth: 1,
          borderColor: Colors.light.border,
          borderTopWidth: 1,
          backgroundColor: 'transparent',
          elevation: 0,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView tint="light" intensity={35} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, styles.tint]} />
          </View>
        ),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <UiIcons.home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          title: 'Missões',
          tabBarIcon: ({ color, size }) => <UiIcons.catalog color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <UiIcons.profile color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tint: {
    backgroundColor: Colors.light.background,
    opacity: 0.12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  item: {
    paddingTop: Spacing.two,
  },
});
