import { create } from "zustand";
import { useIsMdUp } from "./useIsMdUp";


interface MenuState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  type: number;
}

export const useMenuPanelStore = create<MenuState>((set) => ({
  open: true,
  type: 0 , // Default type based on screen size
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));

export function useMenuPanel() {
  const isMdUp = useIsMdUp();
  const store = useMenuPanelStore();

  // If the screen is medium or larger, set open to true and type to 0
  return {
    ...store,
    open:isMdUp ? true : store.open, // Open by default on larger screens
    type: isMdUp ? 0 : 1,
  };
}