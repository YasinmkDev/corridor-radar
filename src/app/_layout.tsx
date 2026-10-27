import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useCorridorStore } from '../store/useCorridorStore';
import { colors } from '../theme';

export default function RootLayout() {
  const mode = useCorridorStore((s) => s.mode);
  return (
    <GestureHandlerRootView
      style={[styles.root, { backgroundColor: mode === 'driver' ? colors.night : colors.canvas }]}
    >
      <SafeAreaProvider>
        <StatusBar style={mode === 'driver' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
