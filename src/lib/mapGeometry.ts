import { colors } from '../theme';
import type { CorridorId, Stop, Vehicle } from '../types';
import { vehiclePosition } from '../store/useCorridorStore';

/**
 * Pure schematic-map geometry. No React, no store subscriptions: every
 * function takes explicit inputs so components can call them inside
 * useMemo. Nothing here may ever be passed to useCorridorStore as a
 * selector (see the 2026-10-28 crash guard in the store file).
 */

/** Corridor identity colour. Used ONLY for the route line + corridor chip. */
export function corridorColor(corridorId: CorridorId): string {
  return corridorId === 'mingora_matta' ? colors.corridorA : colors.corridorB;
}

/** Corridor letter. Identity is never hue alone: letter + name always ride along. */
export function corridorLetter(corridorId: CorridorId): string {
  return corridorId === 'mingora_matta' ? 'A' : 'B';
}

/** Continuous kilometre position of a vehicle along its corridor. */
export function vehicleKm(v: Vehicle, stops: Stop[]): number {
  const current = stops[v.currentStopIndex];
  if (!current || v.progress <= 0) return current ? current.km : 0;
  const step = v.direction === 'UP' ? 1 : -1;
  const nextIndex = v.currentStopIndex + step;
  const next = stops[nextIndex];
  if (!next) return current.km;
  return current.km + v.progress * (next.km - current.km);
}

/** Fraction of the track length for a kilometre position (0..1). */
export function kmFraction(km: number, totalKm: number): number {
  if (totalKm <= 0) return 0;
  return Math.min(1, Math.max(0, km / totalKm));
}

/**
 * Meet-fit math for an SVG viewBox inside a measured container.
 * Mirrors preserveAspectRatio="xMidYMin meet" (vertical map) or
 * "xMidYMid meet" (horizontal strip): scale = min(w/vbW, h/vbH), with the
 * leftover space split per the alignment. Native overlays (markers, hit
 * areas) use this so they land exactly on the SVG geometry.
 */
export function fitRect(
  containerW: number,
  containerH: number,
  vbW: number,
  vbH: number,
  alignY: 'min' | 'mid',
): { scale: number; offsetX: number; offsetY: number } {
  if (containerW <= 0 || containerH <= 0) return { scale: 1, offsetX: 0, offsetY: 0 };
  const scale = Math.min(containerW / vbW, containerH / vbH);
  const renderedW = vbW * scale;
  const renderedH = vbH * scale;
  return {
    scale,
    offsetX: (containerW - renderedW) / 2,
    offsetY: alignY === 'min' ? 0 : (containerH - renderedH) / 2,
  };
}

/**
 * Perpendicular lane offsets (in viewBox units) for vehicles whose track
 * fractions are close enough to overlap. Vehicles sharing a segment sit
 * side by side across the line instead of on top of each other.
 */
export function laneOffsets(fractions: number[]): number[] {
  const offsets = new Array<number>(fractions.length).fill(0);
  const visited = new Array<boolean>(fractions.length).fill(false);
  for (let i = 0; i < fractions.length; i++) {
    if (visited[i]) continue;
    const group = [i];
    visited[i] = true;
    for (let j = i + 1; j < fractions.length; j++) {
      if (!visited[j] && Math.abs(fractions[j] - fractions[i]) < 0.045) {
        group.push(j);
        visited[j] = true;
      }
    }
    group.forEach((idx, k) => {
      offsets[idx] = (k - (group.length - 1) / 2) * 22;
    });
  }
  return offsets;
}

/** The stop a vehicle is heading to: the stop it sits at, or the next one. */
export function nextStopIndexFor(v: Vehicle, stopCount: number): number {
  const step = v.direction === 'UP' ? 1 : -1;
  if (v.progress > 0) {
    return Math.min(stopCount - 1, Math.max(0, v.currentStopIndex + step));
  }
  return v.currentStopIndex;
}

/**
 * Stops a lead vehicle has already passed in its current run, as a set of
 * indices. UP: every stop strictly behind its fractional position; DOWN:
 * every stop strictly beyond it in index terms (it travels downward).
 */
export function passedIndices(v: Vehicle, stopCount: number): Set<number> {
  const pos = vehiclePosition(v);
  const passed = new Set<number>();
  if (v.direction === 'UP') {
    for (let i = 0; i < pos; i++) passed.add(i);
  } else {
    for (let i = Math.floor(pos) + 1; i < stopCount; i++) passed.add(i);
  }
  return passed;
}

/** Stops-away + km-away detail for an ETA headline. */
export function etaDetail(
  v: Vehicle,
  targetStopIndex: number,
  stops: Stop[],
): { stopsAway: number; kmAway: number } {
  const pos = vehiclePosition(v);
  const target = stops[targetStopIndex];
  const kmAway = target ? Math.abs(vehicleKm(v, stops) - target.km) : 0;
  return { stopsAway: Math.ceil(Math.abs(pos - targetStopIndex)), kmAway };
}
