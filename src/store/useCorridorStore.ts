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
  myStopIndex: number;
  seatCount: 1 | 2 | 3;
  needsFamilySeat: boolean;
  myPingIds: Record<CorridorId, string | null>;
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
  claimNextPing: () => string | null;
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
  myStopIndex: 3,
  seatCount: 2,
  needsFamilySeat: false,
  myPingIds: { mingora_matta: null, mingora_bahrain: null },
  vehicles: SEED_VEHICLES,
  pings: SEED_PINGS,
  alerts: [],
  nowMs: Date.now(),

  setMode: (mode) => set({ mode }),
  setCorridor: (corridorId) => {
    const stops = corridorById(corridorId).stops.length;
    set((s) => ({ corridorId, myStopIndex: Math.min(s.myStopIndex, stops - 1) }));
  },
  setDirection: (direction) => set({ direction }),
  setMyStop: (myStopIndex) => set({ myStopIndex }),
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
      const pings = s.pings.filter((p) => p.expiresAt > now);
      const aliveIds = new Set(pings.map((p) => p.id));
      const myPingIds = { ...s.myPingIds };
      (Object.keys(myPingIds) as CorridorId[]).forEach((key) => {
        if (myPingIds[key] && !aliveIds.has(myPingIds[key] as string)) myPingIds[key] = null;
      });
      return {
        vehicles,
        pings,
        alerts: s.alerts.filter((a) => a.expiresAt > now),
        myPingIds,
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
        stopIndex: s.myStopIndex,
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
      };
    }),

  cancelHand: () =>
    set((s) => {
      const id = s.myPingIds[s.corridorId];
      if (!id) return {};
      return {
        pings: s.pings.filter((p) => p.id !== id),
        myPingIds: { ...s.myPingIds, [s.corridorId]: null },
      };
    }),

  claimNextPing: () => {
    const s = get();
    const mine = s.vehicles.find((v) => v.corridorId === s.corridorId && v.isMine);
    if (!mine) return null;
    const stops = corridorById(s.corridorId).stops;
    const step = mine.direction === 'UP' ? 1 : -1;
    const ahead: number[] = [];
    for (let i = 1; i <= 3; i++) {
      const idx = mine.currentStopIndex + step * i;
      if (idx >= 0 && idx < stops.length) ahead.push(idx);
    }
    const term = terminusIndex(s.corridorId, mine.direction);
    const candidates = s.pings.filter(
      (p) =>
        p.corridorId === s.corridorId &&
        p.claimedByVehicleId === null &&
        ((ahead.includes(p.stopIndex) && p.direction === mine.direction) ||
          (p.stopIndex === term && p.direction !== mine.direction)),
    );
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => {
      const da = Math.abs(a.stopIndex - mine.currentStopIndex);
      const db = Math.abs(b.stopIndex - mine.currentStopIndex);
      return da - db || a.createdAt - b.createdAt;
    });
    const target = candidates[0];
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
    return target.id;
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

export function selectVehiclesOnCorridor(s: CorridorState): Vehicle[] {
  return s.vehicles.filter((v) => v.corridorId === s.corridorId);
}

export function selectPingsOnCorridor(s: CorridorState): Ping[] {
  return s.pings.filter((p) => p.corridorId === s.corridorId);
}

export interface ApproachingVehicle {
  vehicle: Vehicle;
  etaMinutes: number;
}

/** Other vehicles moving toward the passenger's stop, nearest first. */
export function selectApproaching(s: CorridorState): ApproachingVehicle[] {
  const out: ApproachingVehicle[] = [];
  for (const v of s.vehicles) {
    if (v.corridorId !== s.corridorId || v.isMine) continue;
    const eta = etaToStop(v, s.myStopIndex);
    if (eta !== null) out.push({ vehicle: v, etaMinutes: eta });
  }
  out.sort((a, b) => a.etaMinutes - b.etaMinutes);
  return out;
}

export interface ForwardRadar {
  ahead: ForwardStop[];
  returnDemand: Ping[];
}

/** Next 3 stops ahead of the driver's vehicle, plus return demand at the far stand. */
export function selectForwardRadar(s: CorridorState): ForwardRadar {
  const mine = selectMyVehicle(s);
  const corridor = corridorById(s.corridorId);
  const step = mine.direction === 'UP' ? 1 : -1;
  const ahead: ForwardStop[] = [];
  for (let i = 1; i <= 3; i++) {
    const idx = mine.currentStopIndex + step * i;
    if (idx < 0 || idx >= corridor.stops.length) break;
    ahead.push({
      stopIndex: idx,
      distanceKm: Math.abs(corridor.stops[idx].km - corridor.stops[mine.currentStopIndex].km),
      pings: s.pings.filter(
        (p) =>
          p.corridorId === s.corridorId &&
          p.stopIndex === idx &&
          p.claimedByVehicleId === null &&
          p.direction === mine.direction,
      ),
    });
  }
  const term = terminusIndex(s.corridorId, mine.direction);
  const returnDemand = s.pings.filter(
    (p) =>
      p.corridorId === s.corridorId &&
      p.stopIndex === term &&
      p.claimedByVehicleId === null &&
      p.direction !== mine.direction,
  );
  return { ahead, returnDemand };
}
