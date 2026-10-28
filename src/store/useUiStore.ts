import { create } from 'zustand';

/**
 * Presentational UI state only — never engine state.
 * `sheetOpen` hides the bottom tab bar while a bottom sheet is open, so
 * the sheet reaches the screen bottom exactly as designed (the design
 * sheets have no tab bar visible beneath them).
 */
interface UiState {
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sheetOpen: false,
  setSheetOpen: (sheetOpen) => set({ sheetOpen }),
}));
