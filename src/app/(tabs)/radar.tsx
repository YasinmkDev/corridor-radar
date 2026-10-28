import { CockpitScreen } from '../../screens/CockpitScreen';
import { DriverShiftScreen } from '../../screens/DriverShiftScreen';
import { RadarPassengerScreen } from '../../screens/RadarPassengerScreen';
import { useProfileStore } from '../../store/useProfileStore';

/**
 * Radar tab: passenger live radar, or the driver shift setup / live
 * cockpit, by the current role.
 */
export default function RadarRoute() {
  const role = useProfileStore((s) => s.role);
  const driverLive = useProfileStore((s) => s.driverLive);
  if (role === 'driver') {
    return driverLive ? <CockpitScreen /> : <DriverShiftScreen />;
  }
  return <RadarPassengerScreen />;
}
