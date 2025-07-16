import { create } from 'zustand';

type AppConfig = {
  maxInputCharactersTextTranslate: number;
  notifyDurationSecondsMs: number;
  paginationPageSize: number;
  languageFrequentlyUsed: string[];
  isHistoryEnabled: boolean;
};

type ConfigStore = {
  config: AppConfig | null;
  setConfig: (config: AppConfig) => void;
};

export const useConfigStore = create<ConfigStore>((set) => ({
  config: null,
  setConfig: (config) => set({ config }),
}));