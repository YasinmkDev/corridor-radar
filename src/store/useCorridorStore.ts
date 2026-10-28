import { create } from 'zustand';

import { corridorById, SEED_PINGS, SEED_VEHICLES } from '../data/seed';
import type {
  AlertTag,
  CorridorId,
  Direction,
  Mode,
  Ping,
  RoadAlert,
  Vehicle,
} from '../types';

export const TICK_MS = 4000;
export const MINUTES_PER_STOP = 4;

let idCounter = 1000;
const nextId = (prefix: string): string => `${prefix}-${++idCounter}`;

/** Fractional stop coordinate of a vehicle along its corridor. */
export function vehiclePosition(v: Vehicle): number {
  return v.direction === 'UP' ? v.currentStopIndex + v.progress : v.currentStopIndex - v.progress;
}

/**
 * ETA in minutes for a vehicle to reach `targetStopIndex`, or null when the
 * vehicle is moving away from that stop. Derived from stops-away, never GPS.
 */
export function etaToStop(v: Vehicle, targetStopIndex: number): number | null {
  const pos = vehiclePosition(v);
  if (v.direction === 'UP' && pos > targetStopIndex) return null;
  if (v.direction === 'DOWN' && pos < targetStopIndex) return null;
  const away = Math.abs(targetStopIndex - pos);
  if (away <= 0.25) return 0;
  return Math.ceil(away) * MINUTES_PER_STOP;
}

export function minutesLeft(expiresAt: number, now: number): number {
  return Math.max(0, Math.ceil((expiresAt - now) / 60000));
}

export interface ForwardStop {
  stopIndex: number;
  distanceKm: number;
  pings: Ping[];
}

interface CorridorState {
  mode: Mode;
  corridorId: CorridorId;
  direction: Direction;
  /** The passenger's standing stop, remembered per corridor. */
  myStopByCorridor: Record<CorridorId, number>;
  seatCount: 1 | 2 | 3;
  needsFamilySeat: boolean;
  myPingIds: Record<CorridorId, string | null>;
  /** Set when the user's own hand expires: a re-raiseable notice, not a silent loss. */
  expiredNotice: {
    corridorId: CorridorId;
    stopIndex: number;
    direction: Direction;
    passengerCount: number;
    needsFamilySeat: boolean;
  } | null;
  /** Set when the user marks a locked ride complete: the designed trip ending. */
  completedTrip: {
    driverName: string;
    vehicleType: string;
    plateNumber: string;
    passengerCount: number;
  } | null;
  vehicles: Vehicle[];
  pings: Ping[];
  alerts: RoadAlert[];
  /** Wall clock, refreshed on every simulation tick (drives expiry labels). */
  nowMs: number;

  setMode: (mode: Mode) => void;
  setCorridor: (id: CorridorId) => void;
  setDirection: (d: Direction) => void;
  setMyStop: (index: number) => void;
  setSeatCount: (n: 1 | 2 | 3) => void;
  setNeedsFamilySeat: (v: boolean) => void;
  tick: () => void;
  raiseHand: () => void;
  cancelHand: () => void;
  /** Release every hold the driver's vehicle currently owns, seats restored. */
  releaseHold: () => void;
  /** Mark the locked ride complete: ping cleared, held seats freed, thank-you shown. */
  completeTrip: () => void;
  dismissCompletedTrip: () => void;
  dismissExpiredNotice: () => void;
  /** Re-raise the expired hand at its original stop, corridor, and direction. */
  raiseAgainFromNotice: () => void;
  /** Claim one specific waiting ping (per-row Claim in the driver cockpit). */
  claimPing: (pingId: string) => boolean;
  adjustMySeats: (delta: number) => void;
  toggleMyFamilySeat: () => void;
  advanceMyVehicle: () => void;
  spotSawari: () => void;
  addRoadAlert: (tag: AlertTag) => void;
}

const terminusIndex = (corridorId: CorridorId, direction: Direction): number => {
  const stops = corridorById(corridorId).stops.length;
  return direction === 'UP' ? stops - 1 : 0;
};

export const useCorridorStore = create<CorridorState>()((set, get) => ({
  mode: 'passenger',
  corridorId: 'mingora_matta',
  direction: 'UP',
  myStopByCorridor: { mingora_matta: 3, mingora_bahrain: 2 },
  seatCount: 2,
  needsFamilySeat: false,
  myPingIds: { mingora_matta: null, mingora_bahrain: null },
  expiredNotice: null,
  completedTrip: null,
  vehicles: SEED_VEHICLES,
  pings: SEED_PINGS,
  alerts: [],
  nowMs: Date.now(),

  setMode: (mode) => set({ mode }),
  setCorridor: (corridorId) => set({ corridorId }),
  setDirection: (direction) => set({ direction }),
  setMyStop: (index) =>
    set((s) => ({
      myStopByCorridor: { ...s.myStopByCorridor, [s.corridorId]: index },
    })),
  setSeatCount: (seatCount) => set({ seatCount }),
  setNeedsFamilySeat: (needsFamilySeat) => set({ needsFamilySeat }),

  tick: () =>
    set((s) => {
      const now = Date.now();
      const vehicles = s.vehicles.map((v) => {
        if (v.isMine) return v;
        const stops = corridorById(v.corridorId).stops.length;
        let { currentStopIndex, progress, direction } = v;
        progress += 0.5;
        if (progress >= 1) {
          progress = 0;
          const next = currentStopIndex + (direction === 'UP' ? 1 : -1);
          if (next > stops - 1) {
            direction = 'DOWN';
          } else if (next < 0) {
            direction = 'UP';
          } else {
            currentStopIndex = next;
          }
        }
        return { ...v, currentStopIndex, progress, direction };
      });
      const expired = s.pings.filter((p) => p.expiresAt <= now);
      const pings = s.pings.filter((p) => p.expiresAt > now);
      const aliveIds = new Set(pings.map((p) => p.id));
      const myPingIds = { ...s.myPingIds };
      let expiredNotice = s.expiredNotice;
      (Object.keys(myPingIds) as CorridorId[]).forEach((key) => {
        if (myPingIds[key] && !aliveIds.has(myPingIds[key] as string)) {
          const lost = expired.find((p) => p.id === myPingIds[key]);
          if (lost && !expiredNotice) {
            expiredNotice = {
              corridorId: lost.corridorId,
              stopIndex: lost.stopIndex,
              direction: lost.direction,
              passengerCount: lost.passengerCount,
              needsFamilySeat: lost.needsFamilySeat,
            };
          }
          myPingIds[key] = null;
        }
      });
      // A claimed ping that expires frees the seats it held (all vehicles,
      // not just the user's) — otherwise holds would leak seats forever.
      const vehiclesWithRestoredSeats = vehicles.map((v) => {
        const freed = expired
          .filter((p) => p.claimedByVehicleId === v.id)
          .reduce((sum, p) => sum + p.passengerCount, 0);
        return freed > 0
          ? { ...v, availableSeats: Math.min(v.capacity, v.availableSeats + freed) }
          : v;
      });
      return {
        vehicles: vehiclesWithRestoredSeats,
        pings,
        alerts: s.alerts.filter((a) => a.expiresAt > now),
        myPingIds,
        expiredNotice,
        nowMs: now,
      };
    }),

  raiseHand: () =>
    set((s) => {
      const oldId = s.myPingIds[s.corridorId];
      const rest = oldId ? s.pings.filter((p) => p.id !== oldId) : s.pings;
      const now = Date.now();
      const ping: Ping = {
        id: nextId('ping'),
        corridorId: s.corridorId,
        stopIndex: s.myStopByCorridor[s.corridorId],
        direction: s.direction,
        passengerCount: s.seatCount,
        needsFamilySeat: s.needsFamilySeat,
        claimedByVehicleId: null,
        source: 'hand',
        createdAt: now,
        expiresAt: now + 30 * 60 * 1000,
      };
      return {
        pings: [...rest, ping],
        myPingIds: { ...s.myPingIds, [s.corridorId]: ping.id },
        expiredNotice: null,
      };
    }),

  cancelHand: () =>
    set((s) => {
      const id = s.myPingIds[s.corridorId];
      if (!id) return {};
      const ping = s.pings.find((p) => p.id === id);
      // Cancelling a claimed hold frees the seats it held; cancelling an
      // unclaimed hand frees nothing. Previously the seats leaked.
      const vehicles =
        ping?.claimedByVehicleId
          ? s.vehicles.map((v) =>
              v.id === ping.claimedByVehicleId
                ? {
                    ...v,
                    availableSeats: Math.min(v.capacity, v.availableSeats + ping.passengerCount),
                  }
                : v,
            )
          : s.vehicles;
      return {
        vehicles,
        pings: s.pings.filter((p) => p.id !== id),
        myPingIds: { ...s.myPingIds, [s.corridorId]: null },
      };
    }),

  releaseHold: () =>
    set((s) => {
      const mine = s.vehicles.find((v) => v.corridorId === s.corridorId && v.isMine);
      if (!mine) return {};
      const held = s.pings.filter((p) => p.claimedByVehicleId === mine.id);
      if (held.length === 0) return {};
      const freed = held.reduce((sum, p) => sum + p.passengerCount, 0);
      return {
        pings: s.pings.map((p) =>
          p.claimedByVehicleId === mine.id ? { ...p, claimedByVehicleId: null } : p,
        ),
        vehicles: s.vehicles.map((v) =>
          v.id === mine.id
            ? { ...v, availableSeats: Math.min(v.capacity, v.availableSeats + freed) }
            : v,
        ),
      };
    }),

  completeTrip: () =>
    set((s) => {
      const id = s.myPingIds[s.corridorId];
      const ping = id ? s.pings.find((p) => p.id === id) : undefined;
      if (!ping || !ping.claimedByVehicleId) return {};
      const vehicle = s.vehicles.find((v) => v.id === ping.claimedByVehicleId);
      if (!vehicle) return {};
      return {
        pings: s.pings.filter((p) => p.id !== ping.id),
        myPingIds: { ...s.myPingIds, [s.corridorId]: null },
        vehicles: s.vehicles.map((v) =>
          v.id === vehicle.id
            ? { ...v, availableSeats: Math.min(v.capacity, v.availableSeats + ping.passengerCount) }
            : v,
        ),
        completedTrip: {
          driverName: vehicle.driverName,
          vehicleType: vehicle.vehicleType,
          plateNumber: vehicle.plateNumber,
          passengerCount: ping.passengerCount,
        },
      };
    }),

  dismissCompletedTrip: () => set({ completedTrip: null }),

  dismissExpiredNotice: () => set({ expiredNotice: null }),

  raiseAgainFromNotice: () =>
    set((s) => {
      const notice = s.expiredNotice;
      if (!notice) return {};
      const now = Date.now();
      const oldId = s.myPingIds[notice.corridorId];
      const rest = oldId ? s.pings.filter((p) => p.id !== oldId) : s.pings;
      const count = Math.min(3, Math.max(1, notice.passengerCount)) as 1 | 2 | 3;
      const ping: Ping = {
        id: nextId('ping'),
        corridorId: notice.corridorId,
        stopIndex: notice.stopIndex,
        direction: notice.direction,
        passengerCount: count,
        needsFamilySeat: notice.needsFamilySeat,
        claimedByVehicleId: null,
        source: 'hand',
        createdAt: now,
        expiresAt: now + 30 * 60 * 1000,
      };
      return {
        pings: [...rest, ping],
        myPingIds: { ...s.myPingIds, [notice.corridorId]: ping.id },
        myStopByCorridor: { ...s.myStopByCorridor, [notice.corridorId]: notice.stopIndex },
        corridorId: notice.corridorId,
        direction: notice.direction,
        seatCount: count,
        needsFamilySeat: notice.needsFamilySeat,
        expiredNotice: null,
      };
    }),

  claimPing: (pingId) => {
    const s = get();
    const mine = s.vehicles.find((v) => v.corridorId === s.corridorId && v.isMine);
    if (!mine) return false;
    const target = s.pings.find(
      (p) => p.id === pingId && p.corridorId === s.corridorId && p.claimedByVehicleId === null,
    );
    if (!target) return false;
    set((state) => ({
      pings: state.pings.map((p) =>
        p.id === target.id ? { ...p, claimedByVehicleId: mine.id } : p,
      ),
      vehicles: state.vehicles.map((v) =>
        v.id === mine.id
          ? { ...v, availableSeats: Math.max(0, v.availableSeats - target.passengerCount) }
          : v,
      ),
    }));
    return true;
  },

  adjustMySeats: (delta) =>
    set((s) => ({
      vehicles: s.vehicles.map((v) =>
        v.corridorId === s.corridorId && v.isMine
          ? { ...v, availableSeats: Math.min(v.capacity, Math.max(0, v.availableSeats + delta)) }
          : v,
      ),
    })),

  toggleMyFamilySeat: () =>
    set((s) => ({
      vehicles: s.vehicles.map((v) =>
        v.corridorId === s.corridorId && v.isMine ? { ...v, hasFamilySeat: !v.hasFamilySeat } : v,
      ),
    })),

  advanceMyVehicle: () =>
    set((s) => ({
      vehicles: s.vehicles.map((v) => {
        if (!(v.corridorId === s.corridorId && v.isMine)) return v;
        const stops = corridorById(v.corridorId).stops.length;
        const step = v.direction === 'UP' ? 1 : -1;
        const next = v.currentStopIndex + step;
        if (next > stops - 1) return { ...v, direction: 'DOWN' as Direction, progress: 0 };
        if (next < 0) return { ...v, direction: 'UP' as Direction, progress: 0 };
        return { ...v, currentStopIndex: next, progress: 0 };
      }),
    })),

  spotSawari: () =>
    set((s) => {
      const mine = s.vehicles.find((v) => v.corridorId === s.corridorId && v.isMine);
      if (!mine) return {};
      const now = Date.now();
      const existing = s.pings.find(
        (p) =>
          p.corridorId === s.corridorId &&
          p.stopIndex === mine.currentStopIndex &&
          p.source === 'spotted' &&
          p.claimedByVehicleId === null,
      );
      if (existing) {
        return {
          pings: s.pings.map((p) =>
            p.id === existing.id ? { ...p, expiresAt: now + 30 * 60 * 1000 } : p,
          ),
        };
      }
      const ping: Ping = {
        id: nextId('spot'),
        corridorId: s.corridorId,
        stopIndex: mine.currentStopIndex,
        direction: mine.direction,
        passengerCount: 2,
        needsFamilySeat: false,
        claimedByVehicleId: null,
        source: 'spotted',
        createdAt: now,
        expiresAt: now + 30 * 60 * 1000,
      };
      return { pings: [...s.pings, ping] };
    }),

  addRoadAlert: (tag) =>
    set((s) => {
      const mine = s.vehicles.find((v) => v.corridorId === s.corridorId && v.isMine);
      if (!mine) return {};
      const now = Date.now();
      const rest = s.alerts.filter(
        (a) =>
          !(
            a.corridorId === s.corridorId &&
            a.stopIndex === mine.currentStopIndex &&
            a.tag === tag
          ),
      );
      return {
        alerts: [
          ...rest,
          {
            id: nextId('alert'),
            corridorId: s.corridorId,
            stopIndex: mine.currentStopIndex,
            tag,
            createdAt: now,
            expiresAt: now + 30 * 60 * 1000,
          },
        ],
      };
    }),
}));

/* ---------------- Selectors ---------------- */

/** The passenger's standing stop on the current corridor (remembered per corridor). */
export function selectMyStopIndex(s: CorridorState): number {
  return s.myStopByCorridor[s.corridorId];
}

export function selectMyVehicle(s: CorridorState): Vehicle {
  return (
    s.vehicles.find((v) => v.corridorId === s.corridorId && v.isMine) ?? s.vehicles[0]
  );
}

export function selectMyPing(s: CorridorState): Ping | null {
  const id = s.myPingIds[s.corridorId];
  if (!id) return null;
  return s.pings.find((p) => p.id === id) ?? null;
}

export interface ApproachingVehicle {
  vehicle: Vehicle;
  etaMinutes: number;
}

/**
 * Other vehicles moving toward the passenger's stop, nearest first.
 * Pure helper over explicit inputs: call it inside useMemo in components.
 * It must NOT be passed directly to useCorridorStore — it builds a new
 * array on every call, and an unstable selector crashes React with
 * "Maximum update depth exceeded" (hit 2026-10-28 on the first phone run).
 */
export function getApproachingVehicles(
  vehicles: Vehicle[],
  corridorId: CorridorId,
  myStopIndex: number,
): ApproachingVehicle[] {
  const out: ApproachingVehicle[] = [];
  for (const v of vehicles) {
    if (v.corridorId !== corridorId || v.isMine) continue;
    const eta = etaToStop(v, myStopIndex);
    if (eta !== null) out.push({ vehicle: v, etaMinutes: eta });
  }
  out.sort((a, b) => a.etaMinutes - b.etaMinutes);
  return out;
}

export interface ForwardRadar {
  ahead: ForwardStop[];
  returnDemand: Ping[];
}

/**
 * Next 3 stops ahead of the driver's vehicle, plus return demand at the far stand.
 * Pure helper over explicit inputs: call it inside useMemo in components.
 * It must NOT be passed directly to useCorridorStore — it builds a new
 * object (with new inner arrays) on every call, and an unstable selector
 * crashes React with "Maximum update depth exceeded".
 */
export function getForwardRadar(
  mine: Vehicle,
  pings: Ping[],
  corridorId: CorridorId,
): ForwardRadar {
  const corridor = corridorById(corridorId);
  const step = mine.direction === 'UP' ? 1 : -1;
  const ahead: ForwardStop[] = [];
  for (let i = 1; i <= 3; i++) {
    const idx = mine.currentStopIndex + step * i;
    if (idx < 0 || idx >= corridor.stops.length) break;
    ahead.push({
      stopIndex: idx,
      distanceKm: Math.abs(corridor.stops[idx].km - corridor.stops[mine.currentStopIndex].km),
      pings: pings.filter(
        (p) =>
          p.corridorId === corridorId &&
          p.stopIndex === idx &&
          p.claimedByVehicleId === null &&
          p.direction === mine.direction,
      ),
    });
  }
  const term = terminusIndex(corridorId, mine.direction);
  const returnDemand = pings.filter(
    (p) =>
      p.corridorId === corridorId &&
      p.stopIndex === term &&
      p.claimedByVehicleId === null &&
      p.direction !== mine.direction,
  );
  return { ahead, returnDemand };
}
