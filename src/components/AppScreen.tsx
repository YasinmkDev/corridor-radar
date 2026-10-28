import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme';

interface Props {
  children: ReactNode;
  /** Scrollable content (auth/setup flows) vs fixed layout (tab screens). */
  scroll?: boolean;
}

/** Screen shell: cream canvas, safe area, standard gutters. */
export function AppScreen({ children, scroll = true }: Props) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.fixed}>{children}</View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 12 },
  fixed: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 12 },
});
