import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { guestSchema, type GuestSettings } from './schema';

type StudioState = GuestSettings & {
  envelopeReady: boolean;
  opened: boolean;
  galleryIndex: number;
  soundPrimed: boolean;
  setGuest: (name: string) => void;
  setOpened: (opened: boolean) => void;
  setEnvelopeReady: (ready: boolean) => void;
  setGalleryIndex: (index: number) => void;
  toggleSound: () => void;
  setMotion: (enabled: boolean) => void;
  setQuality: (quality: GuestSettings['quality']) => void;
  setEngine: (engine: GuestSettings['engine']) => void;
  resetExperience: () => void;
};

const defaults = guestSchema.parse({});

export const useStudioStore = create<StudioState>()(persist((set, get) => ({
  ...defaults,
  envelopeReady: false,
  opened: false,
  galleryIndex: 0,
  soundPrimed: false,
  setGuest: name => set({ name: name.trim().slice(0, 48) || 'معزز مہمان' }),
  setOpened: opened => set({ opened }),
  setEnvelopeReady: envelopeReady => set({ envelopeReady }),
  setGalleryIndex: galleryIndex => set({ galleryIndex }),
  toggleSound: () => set({ soundEnabled: !get().soundEnabled, soundPrimed: true }),
  setMotion: motionEnabled => set({ motionEnabled }),
  setQuality: quality => set({ quality }),
  setEngine: engine => set({ engine }),
  resetExperience: () => set({ opened: false, envelopeReady: false, galleryIndex: 0 })
}), {
  name: 'bilal-hasan-invitation-settings',
  storage: createJSONStorage(() => localStorage),
  partialize: state => ({
    name: state.name,
    soundEnabled: state.soundEnabled,
    motionEnabled: state.motionEnabled,
    quality: state.quality,
    engine: state.engine
  })
}));
