import { useEffect } from 'react';
import { Tabs } from 'expo-router';

import { TabBar } from '../../components/TabBar';
import { TICK_MS, useCorridorStore } from '../../store/useCorridorStore';
import { useUiStore } from '../../store/useUiStore';

export default function TabsLayout() {
  const sheetOpen = useUiStore((s) => s.sheetOpen);

  useEffect(() => {
    const id = setInterval(() => useCorridorStore.getState().tick(), TICK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={sheetOpen ? () => null : (props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="corridors" />
      <Tabs.Screen name="radar" />
      <Tabs.Screen name="fares" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
