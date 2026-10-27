export type CorridorId = 'mingora_matta' | 'mingora_bahrain';
export type Direction = 'UP' | 'DOWN';
export type VehicleType = 'Toyota Fielder' | 'Hiace Coach' | 'Suzuki Carry';
export type Mode = 'passenger' | 'driver';
export type PingSource = 'hand' | 'spotted';
export type AlertTag = 'Landslide/Block' | 'Traffic Jam' | 'Mechanic SOS';

export interface Stop {
  name: string;
  km: number;
}

export interface Corridor {
  id: CorridorId;
  label: string;
  from: string;
  to: string;
  stops: Stop[];
  /**
   * DEMO placeholder only — not a real tariff. Estimated fare per stop
   * segment, used to show an "Est. fare" before a passenger commits.
   * Replace with real tariff data before any real-world use.
   */
  farePerStop: number;
}

export interface Vehicle {
  id: string;
  corridorId: CorridorId;
  driverName: string;
  vehicleType: VehicleType;
  plateNumber: string;
  verifiedAdda: boolean;
  rating: number;
  tripsCompleted: number;
  capacity: number;
  availableSeats: number;
  hasFamilySeat: boolean;
  currentStopIndex: number;
  /** 0 = at currentStopIndex, 0.5 = halfway to the next stop in `direction`. */
  progress: number;
  direction: Direction;
  /** The vehicle the user drives in Driver Cockpit. One per corridor. */
  isMine: boolean;
}

export interface Ping {
  id: string;
  corridorId: CorridorId;
  stopIndex: number;
  direction: Direction;
  passengerCount: number;
  needsFamilySeat: boolean;
  claimedByVehicleId: string | null;
  source: PingSource;
  createdAt: number;
  expiresAt: number;
}

export interface RoadAlert {
  id: string;
  corridorId: CorridorId;
  stopIndex: number;
  tag: AlertTag;
  createdAt: number;
  expiresAt: number;
}
