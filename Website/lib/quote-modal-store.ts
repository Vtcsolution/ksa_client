import { create } from 'zustand';

/** حالة نافذة «اطلب عرض سعر» العامة — تُفتح من أي زر CTA في الموقع */
interface QuoteModalState {
  open: boolean;
  source: string;
  service?: string;
  note?: string;
  openQuote: (opts?: { source?: string; service?: string; note?: string }) => void;
  closeQuote: () => void;
}

export const useQuoteModal = create<QuoteModalState>((set) => ({
  open: false,
  source: 'quote-modal',
  service: undefined,
  note: undefined,
  openQuote: (opts) =>
    set({ open: true, source: opts?.source || 'quote-modal', service: opts?.service, note: opts?.note }),
  closeQuote: () => set({ open: false }),
}));
