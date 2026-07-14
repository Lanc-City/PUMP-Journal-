import { create } from 'zustand';

type AccentColorState = {
  accentColor: string;
  setAccentColor: (color: string) => void;
};

export const useAccentColorStore = create<AccentColorState>((set) => ({
  accentColor: '#006978', // Default accent color
  setAccentColor: (color) => set({ accentColor: color }),
}));