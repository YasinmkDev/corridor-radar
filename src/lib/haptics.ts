import * as Haptics from 'expo-haptics';

/**
 * Haptics, wired only where they mean something (Design Mastery 6.8):
 * - selection tick: a value changed (mode, corridor, direction, stop,
 *   seat count, family toggle, stepper, spot, alert, release).
 * - success notification: a task completed (hand raised, hold claimed,
 *   trip completed).
 * No generic press haptics: every tap already gets instant visual
 * feedback, and haptics are never the only channel for information.
 */
export function tick() {
  void Haptics.selectionAsync();
}

export function success() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
