import { Redirect } from 'expo-router';

import { WelcomeScreen } from '../screens/WelcomeScreen';
import { useProfileStore } from '../store/useProfileStore';

export default function Index() {
  const setupDone = useProfileStore((s) => s.setupDone);
  if (setupDone) {
    return <Redirect href="/(tabs)/radar" />;
  }
  return <WelcomeScreen />;
}
