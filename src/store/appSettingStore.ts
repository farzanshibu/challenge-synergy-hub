import { create } from 'zustand'

interface AppSettingsState {
  isModernUI: boolean
  setModernUI: (isModern: boolean) => void
}

export const useAppSettings = create<AppSettingsState>((set) => ({
  isModernUI: true, // Default to modern UI
  setModernUI: (isModern) => set({ isModernUI: isModern }),
}))
