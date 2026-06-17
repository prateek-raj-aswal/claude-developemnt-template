'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeName, DensityName } from '@/lib/theme'
import { DENSITY } from '@/lib/theme'

function applyDensityCSSVars(density: DensityName) {
  const d = DENSITY[density]
  const r = document.documentElement
  r.style.setProperty('--card-pad',    `${d.cardPad}px`)
  r.style.setProperty('--card-radius', `${d.cardRadius}px`)
  r.style.setProperty('--card-gap',    `${d.cardGap}px`)
  r.style.setProperty('--card-fs',     `${d.cardFs}px`)
  r.style.setProperty('--card-line',   `${d.cardLine}`)
  r.style.setProperty('--meta-fs',     `${d.metaFs}px`)
  r.style.setProperty('--column-pad',  `${d.columnPad}px`)
  r.style.setProperty('--column-gap',  `${d.columnGap}px`)
  r.style.setProperty('--avatar-size', `${d.avatarSize}px`)
  r.style.setProperty('--row-pad',     `${d.rowPad}px`)
}

interface ThemeStore {
  theme: ThemeName
  density: DensityName
  setTheme: (name: ThemeName) => void
  setDensity: (density: DensityName) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      density: 'comfortable',
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => {
        applyDensityCSSVars(density)
        set({ density })
      },
    }),
    {
      name: 'kanban_theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyDensityCSSVars(state.density)
        }
      },
    }
  )
)
