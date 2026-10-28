import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Radar, ReceiptText, Route, User } from 'lucide-react-native';

import { colors, radius, typeScale } from '../theme';

/** Structural subset of the tab bar props Expo Router passes. */
interface TabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    navigate: (name: string) => void;
  };
}

const TABS: Record<string, { label: string; icon: (color: string) => React.ReactNode }> = {
  corridors: {
    label: 'Corridors',
    icon: (color) => <Route size={22} color={color} />,
  },
  radar: {
    label: 'Radar',
    icon: (color) => <Radar size={22} color={color} />,
  },
  fares: {
    label: 'Fares',
    icon: (color) => <ReceiptText size={22} color={color} />,
  },
  account: {
    label: 'Account',
    icon: (color) => <User size={22} color={color} />,
  },
};

/** Bottom tab bar for the main screens, as designed (4 tabs). */
export function TabBar({ state, navigation }: TabBarProps) {
  return (
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const color = focused ? colors.white : colors.muted;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: focused }}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
          >
            <View style={[styles.tile, focused && styles.tileFocused]}>
              {tab.icon(color)}
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 8,
    paddingBottom: 20,
  },
  tab: { flex: 1, alignItems: 'center', minHeight: 56, justifyContent: 'center' },
  tile: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.card },
  tileFocused: { backgroundColor: colors.primary },
  label: { ...typeScale.labelMd },
});
