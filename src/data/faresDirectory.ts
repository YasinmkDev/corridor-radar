/**
 * Fares directory content, transcribed exactly from design screen 11
 * (Corridors & Official Fares Directory). These are directory figures
 * from the design files, not live data and not measured tariffs — the
 * live radar keeps using the store's demo per-stop rates.
 */
import type { CorridorId } from '../types';

export interface FareRow {
  vehicle: string;
  range: string;
  perSeat: boolean;
}

export interface DirectoryCorridor {
  /** Live corridor id, or null for directory-only rows. */
  liveId: CorridorId | null;
  title: string;
  km: number;
  meta: string;
  waypoints: string[];
  fares: FareRow[];
  note?: string;
  noteTone?: 'demand' | 'ok';
  /** Design's active-vehicle figure, shown as designed. */
  activeText?: string;
  /** Numeric active count (for live summary strips). */
  activeCount?: number;
}

export const FARE_DIRECTORY: DirectoryCorridor[] = [
  {
    liveId: 'mingora_matta',
    title: 'Mingora ↔ Matta Corridor',
    km: 22,
    meta: 'Avg. 40 mins • West Bank Route',
    waypoints: ['Mingora Stand', 'Kanju', 'Dherai', 'Kabal', 'Sirsinai', 'Matta'],
    fares: [
      { vehicle: 'Toyota Fielder / Probox', range: 'Rs. 70 – 120', perSeat: true },
      { vehicle: 'Toyota Hiace Coach', range: 'Rs. 50 – 90', perSeat: true },
    ],
    note: 'High demand at Kabal Chowk',
    noteTone: 'demand',
    activeText: '14 Cars Active Now',
    activeCount: 14,
  },
  {
    liveId: 'mingora_bahrain',
    title: 'Mingora ↔ Charbagh ↔ Khwazakhela ↔ Bahrain',
    km: 58,
    meta: 'N-95 River Road',
    waypoints: ['Mingora', 'Charbagh', 'Khwazakhela', 'Fatehpur', 'Madyan', 'Bahrain'],
    fares: [
      { vehicle: 'Fielder / Sedan', range: 'Rs. 150 – 350', perSeat: false },
      { vehicle: 'Hiace Coach', range: 'Rs. 100 – 250', perSeat: false },
    ],
    note: 'Scenic Upper Swat Highway • Normal Flow',
    noteTone: 'ok',
    activeText: '19 Cars Active',
    activeCount: 19,
  },
  {
    liveId: null,
    title: 'Mingora ↔ Malam Jabba (Mountain Pass)',
    km: 40,
    meta: 'Elevation 2,804m',
    waypoints: ['Mingora', 'Malam Jabba'],
    fares: [
      { vehicle: 'Jeep / Shared 4x4', range: 'Rs. 300 – 500', perSeat: true },
      { vehicle: 'Shared Sedan Adda Board', range: 'Express Highway', perSeat: false },
    ],
    activeText: '6 Cars (4x4 & Jeeps)',
    activeCount: 6,
  },
  {
    liveId: null,
    title: 'Mingora ↔ Swat Motorway ➔ Peshawar / Islamabad',
    km: 0,
    meta: '',
    waypoints: ['Mingora Central', 'Peshawar', 'Islamabad'],
    fares: [
      { vehicle: 'AC Deluxe Car (Terminal Seat)', range: 'Rs. 1,200 – 1,800', perSeat: false },
    ],
    note: 'Departs every 20 mins from Mingora Central',
    noteTone: 'ok',
  },
];

/**
 * Per-seat fare shown on live radar cards, from design screen 5
 * (Hiace Rs. 50/seat, Fielder Rs. 70/seat). Other vehicle types fall back
 * to the corridor's demo per-stop rate.
 */
export function radarFarePerSeat(vehicleType: string, corridorFarePerStop: number): number {
  if (vehicleType === 'Hiace Coach') return 50;
  if (vehicleType === 'Toyota Fielder') return 70;
  return corridorFarePerStop;
}
