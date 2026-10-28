import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, G, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { Bus, Car, Truck } from 'lucide-react-native';

import { colors, radius, typeScale } from '../theme';
import type { Corridor, Ping, RoadAlert, Vehicle } from '../types';
import {
  corridorColor,
  fitRect,
  kmFraction,
  laneOffsets,
  nextStopIndexFor,
  passedIndices,
  vehicleKm,
} from '../lib/mapGeometry';
import { shortStopName } from '../lib/stopNames';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* Vertical map geometry (viewBox units). Spine scaled by kilometres.
   Spine sits right of centre so a 72px marker lane fits on its left while
   labels keep a clear gap on its right. */
const V_W = 360;
const V_H = 560;
const SPINE_X = 150;
const V_TOP = 32;
const V_TRACK = 440;
/* Horizontal strip geometry. */
const H_W = 400;
const H_H = 112;
const SPINE_Y = 56;
const H_LEFT = 16;
const H_TRACK = 368;

type StopState = 'passed' | 'upcoming' | 'next' | 'selected';

interface StopOverlay {
  demandCount: number;
  familyNeed: boolean;
  alertCount: number;
}

interface RouteMapProps {
  corridor: Corridor;
  /** Callers pass arrays already scoped to `corridor` (RouteMap filters by stop only). */
  vehicles: Vehicle[];
  pings: Ping[];
  alerts: RoadAlert[];
  /** Passenger standing stop; -1 when not applicable (driver strip). */
  myStopIndex: number;
  selectedStopIndex: number | null;
  /** No-op when non-interactive; only used for taps. */
  onSelectStop?: (index: number | null) => void;
  /** Vertical: vehicle tagged YOU. Strip: own vehicle (inverted pill + behind-greying). */
  myVehicleId: string | null;
  /** Vehicle whose next stop pulses (vertical: lead approaching; strip: own vehicle). */
  leadVehicleId: string | null;
  /** Minutes for the map ETA pill above the lead marker (vertical only). */
  etaForLead: number | null;
  dark: boolean;
  orientation: 'vertical' | 'horizontal';
  interactive: boolean;
  selectedVehicleId: string | null;
  /** No-op when non-interactive; only used for taps. */
  onSelectVehicle?: (id: string | null) => void;
}

function usePulse() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (alive) setReducedMotion(v);
    });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [reducedMotion, pulse]);
  return { reducedMotion, pulse };
}

/**
 * Static SVG layer: canvas, grid, ruler, route stack, nodes, labels,
 * badges. Memoised so interaction renders (seat picker, sheet) that do not
 * change map data never re-render the canvas. Vehicle markers live in the
 * native overlay below (animated transforms, no re-render per frame).
 */
const RouteMapSvg = ({
  corridor,
  vehicles,
  pings,
  alerts,
  myStopIndex,
  selectedStopIndex,
  leadVehicleId,
  dark,
  orientation,
  myVehicleId,
}: Omit<RouteMapProps, 'onSelectStop' | 'onSelectVehicle' | 'etaForLead' | 'interactive' | 'selectedVehicleId'>) => {
  const { reducedMotion, pulse } = usePulse();
  const pulseR = pulse.interpolate({ inputRange: [0, 1], outputRange: [15, 23] });
  const pulseO = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  const canvas = dark ? colors.mapCanvasNight : colors.mapCanvasDay;
  const grid = dark ? colors.mapGridNight : colors.mapGridDay;
  const track = dark ? colors.mapTrackNight : colors.mapTrackDay;
  const ink = dark ? colors.nightText : colors.ink;
  const secondary = dark ? colors.nightSecondary : colors.inkSecondary;
  const nodeFill = dark ? colors.mapCanvasNight : colors.white;
  const lineColor = corridorColor(corridor.id);
  const lineWidth = dark ? 11 : 10;
  const totalKm = corridor.stops[corridor.stops.length - 1].km;

  const lead = leadVehicleId ? (vehicles.find((v) => v.id === leadVehicleId) ?? null) : null;
  const leadNext = lead ? nextStopIndexFor(lead, corridor.stops.length) : null;
  const leadPassed = lead ? passedIndices(lead, corridor.stops.length) : new Set<number>();
  const mine = myVehicleId ? (vehicles.find((v) => v.id === myVehicleId) ?? null) : null;
  const myKm = mine ? vehicleKm(mine, corridor.stops) : null;

  const overlayFor = (stopIndex: number): StopOverlay => {
    const atStop = pings.filter((p) => p.stopIndex === stopIndex);
    const open = atStop.filter((p) => p.claimedByVehicleId === null);
    return {
      demandCount: open.reduce((sum, p) => sum + p.passengerCount, 0),
      familyNeed: open.some((p) => p.needsFamilySeat),
      alertCount: alerts.filter((a) => a.stopIndex === stopIndex).length,
    };
  };

  const stateFor = (i: number): StopState => {
    if (selectedStopIndex === i) return 'selected';
    if (leadNext === i) return 'next';
    if (leadPassed.has(i)) return 'passed';
    return 'upcoming';
  };

  const isBehind = (stopKm: number): boolean => {
    if (orientation !== 'horizontal' || mine === null || myKm === null) return false;
    return mine.direction === 'UP' ? stopKm < myKm : stopKm > myKm;
  };

  const gridPath =
    orientation === 'vertical'
      ? [0, 60, 120, 180, 240, 300, 360].map((x) => `M${x} 0 V${V_H}`).join(' ') +
        [0, 56, 112, 168, 224, 280, 336, 392, 448, 504, 560].map((y) => `M0 ${y} H${V_W}`).join(' ')
      : [0, 56, 112, 168, 224, 280, 336, 392, 400].map((x) => `M${x} 0 V${H_H}`).join(' ') +
        [0, 56, 112].map((y) => `M0 ${y} H${H_W}`).join(' ');

  const routeD =
    orientation === 'vertical'
      ? `M${SPINE_X} ${V_TOP} V${V_TOP + V_TRACK}`
      : `M${H_LEFT} ${SPINE_Y} H${H_LEFT + H_TRACK}`;

  const stopPoint = (i: number): { x: number; y: number } => {
    const f = kmFraction(corridor.stops[i].km, totalKm);
    if (orientation === 'vertical') {
      return { x: SPINE_X, y: V_TOP + f * V_TRACK };
    }
    return { x: H_LEFT + f * H_TRACK, y: SPINE_Y };
  };

  /* Vertical label de-collision: two-line labels sit right of the spine
     (short names, so they always fit the canvas). Nudge a label down to
     the nearest free slot if it would overlap the previous one, and never
     let the last label run off the canvas bottom. Stop gaps (80+ units)
     exceed label height, so shifts are 0 in practice — this is a guard. */
  const labelShift: number[] = [];
  if (orientation === 'vertical') {
    let prevBottom = -Infinity;
    corridor.stops.forEach((_, i) => {
      const { y } = stopPoint(i);
      let top = y - 12;
      if (top < prevBottom + 6) top = prevBottom + 6;
      if (top + 40 > 556) top = 556 - 40;
      labelShift.push(top - (y - 12));
      prevBottom = top + 40;
    });
  } else {
    corridor.stops.forEach(() => labelShift.push(0));
  }

  const rulerTicks =
    orientation === 'vertical'
      ? [0, Math.round(totalKm / 2), totalKm].map((km, k) => ({
          y: V_TOP + kmFraction(km, totalKm) * V_TRACK,
          label: String(k === 0 ? 0 : k === 1 ? Math.round(totalKm / 2) : totalKm),
        }))
      : [];

  const pulseRing = (cx: number, cy: number, stroke: string, key: string) =>
    reducedMotion ? (
      <Circle key={key} cx={cx} cy={cy} r={17} fill="none" stroke={stroke} strokeWidth={2} opacity={0.25} />
    ) : (
      <AnimatedCircle
        key={key}
        cx={cx}
        cy={cy}
        r={pulseR}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        opacity={pulseO}
      />
    );

  const label = (
    x: number,
    y: number,
    text: string,
    fill: string,
    style: { fontSize: number; fontWeight: string },
    anchor: 'start' | 'middle',
    key: string,
  ) => (
    <G key={key}>
      <SvgText x={x} y={y} fontSize={style.fontSize} fontWeight={style.fontWeight} fill="none" stroke={canvas} strokeWidth={3} textAnchor={anchor}>
        {text}
      </SvgText>
      <SvgText x={x} y={y} fontSize={style.fontSize} fontWeight={style.fontWeight} fill={fill} textAnchor={anchor}>
        {text}
      </SvgText>
    </G>
  );

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={orientation === 'vertical' ? `0 0 ${V_W} ${V_H}` : `0 0 ${H_W} ${H_H}`}
      preserveAspectRatio={orientation === 'vertical' ? 'xMidYMin meet' : 'xMidYMid meet'}
    >
      <Rect x={0} y={0} width={orientation === 'vertical' ? V_W : H_W} height={orientation === 'vertical' ? V_H : H_H} fill={canvas} />
      <Path d={gridPath} stroke={grid} strokeWidth={1} />
      {/* Route stack: casing, track, corridor line. Line colour never changes with state. */}
      <Path d={routeD} stroke={canvas} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={routeD} stroke={track} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={routeD} stroke={lineColor} strokeWidth={lineWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {orientation === 'vertical' ? (
        <Path d={`M30 ${V_TOP} V${V_TOP + V_TRACK}`} stroke={track} strokeWidth={1} />
      ) : null}
      {rulerTicks.map((t, k) => (
        <G key={`ruler-${k}`}>
          <Path d={`M26 ${t.y} H34`} stroke={secondary} strokeWidth={1} />
          {label(14, t.y + 3, t.label, secondary, typeScale.mapRuler, 'middle', `ruler-label-${k}`)}
        </G>
      ))}
      {corridor.stops.map((stop, i) => {
        const { x, y } = stopPoint(i);
        const isTerminus = i === 0 || i === corridor.stops.length - 1;
        const state = orientation === 'vertical' ? stateFor(i) : 'upcoming';
        const overlay = overlayFor(i);
        const behind = isBehind(stop.km);
        const node = isTerminus ? (
          <G key={`term-${i}`}>
            <Rect x={x - 14} y={y - 14} width={28} height={28} rx={8} fill={lineColor} />
            <Circle cx={x} cy={y} r={7} fill={colors.white} />
            {state === 'selected' ? (
              <Rect x={x - 17} y={y - 17} width={34} height={34} rx={10} fill="none" stroke={ink} strokeWidth={2} />
            ) : null}
            {state === 'next' ? pulseRing(x, y, lineColor, `pulse-next-${i}`) : null}
          </G>
        ) : state === 'passed' ? (
          <Circle key={`node-${i}`} cx={x} cy={y} r={8} fill={lineColor} />
        ) : state === 'next' ? (
          <G key={`node-${i}`}>
            <Circle cx={x} cy={y} r={14} fill={nodeFill} stroke={lineColor} strokeWidth={3} />
            {pulseRing(x, y, lineColor, `pulse-next-${i}`)}
          </G>
        ) : state === 'selected' ? (
          <G key={`node-${i}`}>
            <Circle cx={x} cy={y} r={17} fill="none" stroke={canvas} strokeWidth={2} />
            <Circle cx={x} cy={y} r={14} fill={nodeFill} stroke={ink} strokeWidth={2} />
          </G>
        ) : (
          <Circle key={`node-${i}`} cx={x} cy={y} r={11} fill={nodeFill} stroke={lineColor} strokeOpacity={0.45} strokeWidth={2.5} />
        );
        const badges =
          orientation === 'vertical' ? (
            <G key={`badges-${i}`}>
              {overlay.demandCount > 0 ? (
                <G>
                  <Circle cx={x} cy={y} r={15.5} fill="none" stroke={colors.amberBright} strokeWidth={3} />
                  {pulseRing(x, y, colors.amberBright, `pulse-demand-${i}`)}
                  <Circle cx={x + 15} cy={y - 15} r={10} fill={colors.amberBright} />
                  <SvgText x={x + 15} y={y - 15 + 3.5} fontSize={typeScale.mapMicro.fontSize} fontWeight={typeScale.mapMicro.fontWeight} fill={colors.ink} textAnchor="middle">
                    {overlay.demandCount}
                  </SvgText>
                </G>
              ) : null}
              {overlay.familyNeed ? (
                <G>
                  <Polygon
                    points={`${x + 15},${y + (overlay.demandCount > 0 ? 15 : -15) - 8} ${x + 15 + 8},${y + (overlay.demandCount > 0 ? 15 : -15)} ${x + 15},${y + (overlay.demandCount > 0 ? 15 : -15) + 8} ${x + 15 - 8},${y + (overlay.demandCount > 0 ? 15 : -15)}`}
                    fill={dark ? colors.indigo : colors.indigoText}
                  />
                  <SvgText x={x + 15} y={y + (overlay.demandCount > 0 ? 15 : -15) + 3.5} fontSize={typeScale.mapTag.fontSize} fontWeight={typeScale.mapTag.fontWeight} fill={colors.white} textAnchor="middle">
                    F
                  </SvgText>
                </G>
              ) : null}
              {overlay.alertCount > 0 ? (
                <G>
                  <Circle cx={x - 15} cy={y + 15} r={7} fill={colors.danger} />
                  <SvgText x={x - 15} y={y + 15 + 3.5} fontSize={typeScale.mapTag.fontSize} fontWeight={typeScale.mapTag.fontWeight} fill={colors.white} textAnchor="middle">
                    !
                  </SvgText>
                </G>
              ) : null}
            </G>
          ) : overlay.demandCount > 0 ? (
            <Circle key={`demand-${i}`} cx={x} cy={y} r={15.5} fill="none" stroke={colors.amberBright} strokeWidth={3} />
          ) : null;
        const stopLabel =
          orientation === 'vertical' ? (
            <G key={`label-${i}`}>
              {label(x + 80, y + labelShift[i] + 5, shortStopName(stop.name), state === 'passed' ? secondary : ink, typeScale.mapLabel, 'start', `name-${i}`)}
              {label(
                x + 80,
                y + labelShift[i] + 21,
                `${stop.km} km${i === myStopIndex ? ' · You are here' : state === 'next' ? ' · NEXT' : overlay.demandCount > 0 ? ` · ${overlay.demandCount} waiting` : ''}`,
                secondary,
                typeScale.mapMeta,
                'start',
                `meta-${i}`,
              )}
            </G>
          ) : (
            <G key={`label-${i}`}>
              {label(x, i % 2 === 0 ? y - 26 : y + 30, shortStopName(stop.name), ink, typeScale.mapMicro, 'middle', `name-${i}`)}
            </G>
          );
        return (
          <G key={`stop-${i}`} opacity={behind ? 0.3 : 1}>
            {node}
            {badges}
            {stopLabel}
          </G>
        );
      })}
      {orientation === 'vertical' ? (
        label(16, 540, 'Schematic · stops spaced by kilometres · simulated', secondary, typeScale.mapMeta, 'start', 'micro')
      ) : null}
    </Svg>
  );
};

const MarkerGlyph = ({ vehicleType, color }: { vehicleType: Vehicle['vehicleType']; color: string }) => {
  if (vehicleType === 'Hiace Coach') return <Bus size={20} color={color} />;
  if (vehicleType === 'Suzuki Carry') return <Truck size={20} color={color} />;
  return <Car size={20} color={color} />;
};

export function RouteMap(props: RouteMapProps) {
  const {
    corridor,
    vehicles,
    pings,
    alerts,
    myStopIndex,
    selectedStopIndex,
    onSelectStop = () => {},
    myVehicleId,
    leadVehicleId,
    etaForLead,
    dark,
    orientation,
    interactive,
    selectedVehicleId,
    onSelectVehicle = () => {},
  } = props;
  const [layout, setLayout] = useState<{ w: number; h: number } | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [animMap, setAnimMap] = useState(() => new Map<string, Animated.Value>());
  const prevRef = useRef(new Map<string, number>());

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);

  const totalKm = corridor.stops[corridor.stops.length - 1].km;
  const lineColor = corridorColor(corridor.id);
  const isVertical = orientation === 'vertical';
  const vbW = isVertical ? V_W : H_W;
  const vbH = isVertical ? V_H : H_H;

  /* Marker targets: fractions + same-segment lane offsets (the horizontal
     strip keeps these viewBox lanes). The vertical map places markers
     separately below, in screen px, once layout is known. Pure derivation,
     memoised. */
  const markers = useMemo(() => {
    const withFraction = vehicles.map((v) => ({
      v,
      fraction: kmFraction(vehicleKm(v, corridor.stops), totalKm),
    }));
    const lanes = laneOffsets(withFraction.map((m) => m.fraction));
    return withFraction.map((m, k) => ({ ...m, lane: lanes[k] }));
  }, [vehicles, corridor, totalKm]);

  const fit = layout ? fitRect(layout.w, layout.h, vbW, vbH, isVertical ? 'min' : 'mid') : null;

  /* Vertical marker de-collision (screen px): markers whose centres would
     fall within 64px vertically share lanes [on-spine, 72px left]; a third
     marker in one cluster is nudged vertically to the nearest free slot.
     No lane ever goes right, so no marker can sit under a stop label.
     Lateral lane changes jump (only the along-track glide animates). */
  const verticalPlaced = useMemo(() => {
    if (!isVertical || !fit || !layout) return null;
    const spinePx = fit.offsetX + SPINE_X * fit.scale;
    const ordered = markers
      .map((m) => ({
        id: m.v.id,
        yPx: fit.offsetY + (V_TOP + m.fraction * V_TRACK) * fit.scale,
      }))
      .sort((a, b) => a.yPx - b.yPx);
    const placed = new Map<string, { lanePx: number; finalY: number }>();
    const occupied: { lanePx: number; y: number }[] = [];
    const minY = 48;
    const maxY = Math.max(minY, layout.h - 48);
    for (const m of ordered) {
      let lanePx = 0;
      let finalY = m.yPx;
      let done = false;
      for (const lane of [0, -72]) {
        if (!occupied.some((o) => o.lanePx === lane && Math.abs(o.y - m.yPx) < 64)) {
          lanePx = lane;
          done = true;
          break;
        }
      }
      if (!done) {
        lanePx = 0;
        for (let k = 1; k <= 8 && !done; k++) {
          const down = m.yPx + k * 72;
          if (!occupied.some((o) => o.lanePx === 0 && Math.abs(o.y - down) < 64)) {
            finalY = down;
            done = true;
          } else {
            const up = m.yPx - k * 72;
            if (!occupied.some((o) => o.lanePx === 0 && Math.abs(o.y - up) < 64)) {
              finalY = up;
              done = true;
            }
          }
        }
        if (!done) finalY = m.yPx; // pathological pile-up: overlap beats clipping
      }
      finalY = Math.max(minY, Math.min(maxY, finalY));
      placed.set(m.id, { lanePx, finalY });
      occupied.push({ lanePx, y: finalY });
    }
    return { spinePx, placed };
  }, [markers, fit, layout, isVertical]);

  const pointPx = (fraction: number, laneUnits: number): { x: number; y: number } => {
    if (!fit) return { x: 0, y: 0 };
    if (isVertical) {
      return {
        x: fit.offsetX + (SPINE_X + laneUnits) * fit.scale,
        y: fit.offsetY + (V_TOP + fraction * V_TRACK) * fit.scale,
      };
    }
    return {
      x: fit.offsetX + (H_LEFT + fraction * H_TRACK) * fit.scale,
      y: fit.offsetY + (SPINE_Y + laneUnits) * fit.scale,
    };
  };

  /* Glide: on every target change, animate the along-track transform from
     the previous target to the new one over the tick interval. Only the
     transform animates; fills and strokes never change per frame. */
  useEffect(() => {
    if (!fit) return;
    const seen = new Set<string>();
    let changed = false;
    const next = new Map(animMap);
    markers.forEach((m) => {
      seen.add(m.v.id);
      const placedV = isVertical ? verticalPlaced?.placed.get(m.v.id) : undefined;
      const p = pointPx(m.fraction, 0);
      const target = isVertical ? (placedV?.finalY ?? p.y) : p.x;
      let anim = next.get(m.v.id);
      if (!anim) {
        anim = new Animated.Value(0);
        next.set(m.v.id, anim);
        changed = true;
        prevRef.current.set(m.v.id, target);
        return;
      }
      const prev = prevRef.current.get(m.v.id) ?? target;
      prevRef.current.set(m.v.id, target);
      if (prev === target) return;
      anim.setValue(prev - target);
      Animated.timing(anim, {
        toValue: 0,
        duration: reducedMotion ? 0 : 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
    next.forEach((_, id) => {
      if (!seen.has(id)) {
        next.delete(id);
        changed = true;
        prevRef.current.delete(id);
      }
    });
    if (changed) setAnimMap(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, verticalPlaced, fit, reducedMotion, animMap]);

  const lead = leadVehicleId ? (vehicles.find((v) => v.id === leadVehicleId) ?? null) : null;

  const stopPointPx = (i: number): { x: number; y: number } => {
    const f = kmFraction(corridor.stops[i].km, totalKm);
    return pointPx(f, 0);
  };

  return (
    <View
      style={isVertical ? styles.verticalRoot : styles.stripRoot}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setLayout((prev) => (prev && prev.w === width && prev.h === height ? prev : { w: width, h: height }));
      }}
    >
      {interactive ? (
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Map background, clear selection"
          onPress={() => {
            onSelectStop(null);
            onSelectVehicle(null);
          }}
        />
      ) : null}
      <RouteMapSvg
        corridor={corridor}
        vehicles={vehicles}
        pings={pings}
        alerts={alerts}
        myStopIndex={myStopIndex}
        selectedStopIndex={selectedStopIndex}
        leadVehicleId={leadVehicleId}
        dark={dark}
        orientation={orientation}
        myVehicleId={myVehicleId}
      />
      {interactive && fit
        ? corridor.stops.map((stop, i) => {
            const p = stopPointPx(i);
            return (
              <Pressable
                key={`hit-${stop.name}`}
                style={[styles.hit, { left: p.x - 28, top: p.y - 28 }]}
                accessibilityRole="button"
                accessibilityLabel={`${stop.name}, ${stop.km} kilometres${i === myStopIndex ? ', you are standing here' : ''}`}
                onPress={() => onSelectStop(i)}
              />
            );
          })
        : null}
      {fit
        ? markers.map((m) => {
            const p = pointPx(m.fraction, m.lane);
            const placedV = isVertical ? verticalPlaced?.placed.get(m.v.id) : undefined;
            const isMine = m.v.id === myVehicleId;
            const isLead = lead !== null && m.v.id === lead.id;
            const isSelected = selectedVehicleId === m.v.id;
            const anim = animMap.get(m.v.id) ?? new Animated.Value(0);
            const alongTarget = isVertical ? (placedV?.finalY ?? p.y) : p.x;
            const hasTopTag = isVertical && ((isLead && etaForLead !== null) || isMine);
            const crossPx = isVertical
              ? (verticalPlaced ? verticalPlaced.spinePx + (placedV?.lanePx ?? 0) : p.x)
              : p.x;
            const wrapperLeft = (isVertical ? crossPx : alongTarget) - 36;
            const wrapperTop = (isVertical ? alongTarget : p.y) - 17 - (hasTopTag ? 28 : 0);
            const glyphColor = orientation === 'horizontal' && isMine ? colors.white : colors.ink;
            const pillBg = orientation === 'horizontal' && isMine ? colors.ink : colors.white;
            const seatsBg = m.v.availableSeats > 0 ? colors.seatsBadge : colors.inkSecondary;
            const seatsText = m.v.availableSeats > 0 ? `${m.v.availableSeats} seats` : 'Full';
            const noseStyle = (() => {
              if (isVertical) {
                return m.v.direction === 'UP'
                  ? { left: 20, bottom: -2, width: 16, height: 4 }
                  : { left: 20, top: -2, width: 16, height: 4 };
              }
              return m.v.direction === 'UP'
                ? { top: 15, right: -2, width: 4, height: 16 }
                : { top: 15, left: -2, width: 4, height: 16 };
            })();
            const inner = (
              <View style={styles.markerColumn}>
                {isVertical && isLead && etaForLead !== null ? (
                  <View style={[styles.etaPill, { borderColor: colors.hairline }]}>
                    <Text style={styles.etaText}>
                      {etaForLead === 0 ? 'Arriving now' : `${etaForLead} min`}
                    </Text>
                  </View>
                ) : null}
                {isVertical && isMine ? (
                  <View style={styles.youTag}>
                    <Text style={styles.youText}>YOU</Text>
                  </View>
                ) : null}
                <View
                  style={[
                    styles.markerPill,
                    {
                      backgroundColor: pillBg,
                      borderColor: colors.ink,
                      borderWidth: isSelected ? 2.5 : 1.5,
                    },
                  ]}
                >
                  <MarkerGlyph vehicleType={m.v.vehicleType} color={glyphColor} />
                  <View style={[styles.nose, { backgroundColor: lineColor }, noseStyle]} />
                  {m.v.hasFamilySeat ? (
                    <View style={styles.familyDiamond}>
                      <Text style={styles.familyDiamondText}>F</Text>
                    </View>
                  ) : null}
                </View>
                <View style={[styles.seatsBadge, { backgroundColor: seatsBg }]}>
                  <Text style={styles.seatsText}>{seatsText}</Text>
                </View>
              </View>
            );
            /* The wrapper is positioned so the pill centre lands exactly on
               the track point; the glide animates only its transform. */
            const animatedStyle = isVertical
              ? { transform: [{ translateY: anim }] }
              : { transform: [{ translateX: anim }] };
            return (
              <Animated.View
                key={m.v.id}
                style={[styles.markerWrap, { left: wrapperLeft, top: wrapperTop }, animatedStyle]}
                pointerEvents="box-none"
              >
                {interactive ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${m.v.isMine ? 'Your vehicle' : `Ustad ${m.v.driverName.replace(/^Ustad /, '')}`}, ${m.v.vehicleType}, ${seatsText}${m.v.hasFamilySeat ? ', family seat available' : ''}`}
                    onPress={() => onSelectVehicle(m.v.id)}
                    style={styles.markerPress}
                  >
                    {inner}
                  </Pressable>
                ) : (
                  <View style={styles.markerPress}>{inner}</View>
                )}
              </Animated.View>
            );
          })
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  verticalRoot: { flex: 1, backgroundColor: 'transparent' },
  stripRoot: { height: 112 },
  hit: { position: 'absolute', width: 56, height: 56 },
  markerWrap: { position: 'absolute', width: 72, alignItems: 'center' },
  markerPress: { alignItems: 'center' },
  markerColumn: { alignItems: 'center' },
  markerPill: {
    width: 56,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nose: { position: 'absolute', borderRadius: 2 },
  etaPill: {
    backgroundColor: colors.white,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  etaText: { ...typeScale.tiny, color: colors.ink, fontWeight: '700' as const },
  youTag: {
    backgroundColor: colors.ink,
    borderRadius: 8,
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  youText: { ...typeScale.mapTag, color: colors.white },
  seatsBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  seatsText: { ...typeScale.mapMicro, color: colors.white },
  familyDiamond: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    backgroundColor: colors.indigoText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyDiamondText: {
    ...typeScale.mapTag,
    color: colors.white,
    transform: [{ rotate: '-45deg' }],
  },
});
