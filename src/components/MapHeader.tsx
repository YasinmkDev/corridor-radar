import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { colors, radius, typeScale } from '../theme';
import { corridorColor } from '../lib/mapGeometry';
import type { CorridorId, Mode } from '../types';

type MapHeaderProps = {
  corridorId: CorridorId;
  corridorLabel: string;
  /** Destination stop name, shown under the corridor letter. */
  destination: string;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onCorridorChange: (id: CorridorId) => void;
  /** Passenger-only: day/night toggle. Hidden in driver mode (driver is always night). */
  dark: boolean;
  onDarkChange: (dark: boolean) => void;
};

const CORRIDORS: { id: CorridorId; letter: string; label: string }[] = [
  { id: 'mingora_matta', letter: 'A', label: 'Matta' },
  { id: 'mingora_bahrain', letter: 'B', label: 'Bahrain' },
];

export function MapHeader({
  corridorId,
  corridorLabel,
  destination,
  mode,
  onModeChange,
  onCorridorChange,
  dark,
  onDarkChange,
}: MapHeaderProps) {
  const isDriver = mode === 'driver';
  const surface = isDriver || dark ? colors.sheetNight : colors.white;
  const ink = isDriver || dark ? colors.nightText : colors.ink;
  const secondary = isDriver || dark ? colors.nightSecondary : colors.inkSecondary;
  const hairline = isDriver || dark ? colors.nightHairline : colors.hairline;
  const track = isDriver || dark ? colors.nightCard : colors.canvas;
  const activeColor = corridorColor(corridorId);

  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: hairline }]}>
      <View style={styles.row}>
        <View style={styles.chips}>
          {CORRIDORS.map((c) => {
            const active = c.id === corridorId;
            const color = corridorColor(c.id);
            return (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                accessibilityLabel={`Corridor ${c.letter}, Mingora to ${c.label}${active ? ', selected' : ''}`}
                accessibilityState={{ selected: active }}
                onPress={() => onCorridorChange(c.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? color : track,
                    borderColor: active ? color : hairline,
                  },
                ]}
              >
                <Text style={[styles.chipLetter, { color: active ? colors.white : ink }]}>{c.letter}</Text>
                <Text style={[styles.chipLabel, { color: active ? colors.white : ink }]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {!isDriver ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={dark ? 'Switch to day theme' : 'Switch to night theme'}
            onPress={() => onDarkChange(!dark)}
            style={[styles.themeBtn, { backgroundColor: track, borderColor: hairline }]}
          >
            {dark ? (
              <Sun size={18} color={colors.amber} />
            ) : (
              <Moon size={18} color={colors.inkSecondary} />
            )}
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.seg, { backgroundColor: track }]}>
        {(['passenger', 'driver'] as Mode[]).map((m) => {
          const active = m === mode;
          return (
            <Pressable
              key={m}
              accessibilityRole="button"
              accessibilityLabel={`${m === 'passenger' ? 'Passenger' : 'Driver'} mode${active ? ', selected' : ''}`}
              accessibilityState={{ selected: active }}
              onPress={() => onModeChange(m)}
              style={[
                styles.segBtn,
                {
                  backgroundColor: active
                    ? isDriver
                      ? colors.white
                      : colors.emeraldAction
                    : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.segText,
                  { color: active ? (isDriver ? colors.ink : colors.white) : secondary },
                ]}
              >
                {m === 'passenger' ? 'Passenger' : 'Driver'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.destination, { color: secondary }]}>
        {corridorLabel} · Towards {destination}
      </Text>
      <View style={[styles.activeBar, { backgroundColor: activeColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    height: 36,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipLetter: { ...typeScale.smallBold },
  chipLabel: { ...typeScale.smallBold },
  themeBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seg: { flexDirection: 'row', borderRadius: radius.pill, padding: 4, marginTop: 8 },
  segBtn: {
    flex: 1,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segText: { ...typeScale.smallBold },
  destination: { ...typeScale.small, marginTop: 4 },
  activeBar: { height: 3, borderRadius: 2, marginTop: 4 },
});
