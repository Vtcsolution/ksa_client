import { create } from "zustand";

export type ModalState =
  | { type: "leadDetail"; leadId: string }
  | { type: "call"; leadId: string }
  | { type: "visit"; leadId: string }
  | { type: "meeting"; leadId: string }
  | { type: "transfer"; leadId: string }
  | { type: "quote"; leadId: string }
  | { type: "fixData"; leadId: string }
  | { type: "content"; leadId: string }
  | { type: "addField" }
  | { type: "addStaff" }
  | { type: "addContent" }
  | { type: "editPricing" }
  | { type: "addExpense" }
  | { type: "callInsight"; callId: string }
  | null;

interface UiState {
  modal: ModalState;
  openModal: (m: NonNullable<ModalState>) => void;
  closeModal: () => void;
  drawerOpen: boolean;
  toggleDrawer: () => void;
  closeDrawer: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  modal: null,
  openModal: (m) => set({ modal: m }),
  closeModal: () => set({ modal: null }),
  drawerOpen: false,
  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
  closeDrawer: () => set({ drawerOpen: false }),
}));
