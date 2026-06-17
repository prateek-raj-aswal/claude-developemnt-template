'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { THEMES, DENSITY, type ThemeName, type DensityName } from '@/lib/theme'
import { applyTheme } from '@/lib/theme'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import Icon from '@/components/ui/Icon'
import { T } from '@/lib/theme'

// ── Theme metadata ────────────────────────────────────────────────────────────

const THEME_LABELS: Record<ThemeName, string> = {
  light:          'Light',
  midnight:       'Midnight',
  graphite:       'Graphite',
  ocean:          'Ocean',
  sunset:         'Sunset',
  forest:         'Forest',
  'indigo-night': 'Indigo Night',
  'indigo-day':   'Indigo Day',
  'emerald-night':'Emerald Night',
  'emerald-day':  'Emerald Day',
  'ocean-night':  'Ocean Night',
  'ocean-day':    'Ocean Day',
  'violet-night': 'Violet Night',
  'violet-day':   'Violet Day',
  'sunset-night': 'Sunset Night',
  'sunset-day':   'Sunset Day',
  'rose-night':   'Rose Night',
  'rose-day':     'Rose Day',
  'steel-night':  'Steel Night',
  'steel-day':    'Steel Day',
}

const CLASSIC_THEMES: ThemeName[] = ['light', 'midnight', 'graphite', 'ocean', 'sunset', 'forest']

const PREMIUM_DARK_THEMES: ThemeName[] = [
  'indigo-night', 'emerald-night', 'ocean-night',
  'violet-night', 'sunset-night', 'rose-night', 'steel-night',
]

const PREMIUM_LIGHT_THEMES: ThemeName[] = [
  'indigo-day', 'emerald-day', 'ocean-day',
  'violet-day', 'sunset-day', 'rose-day', 'steel-day',
]

const DENSITY_LABELS: Record<DensityName, string> = {
  compact:     'Compact',
  comfortable: 'Comfortable',
  spacious:    'Spacious',
}

const DENSITY_DESCRIPTIONS: Record<DensityName, string> = {
  compact:     'Tighter spacing, more content visible',
  comfortable: 'Balanced spacing (default)',
  spacious:    'Relaxed spacing, easier to read',
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface SwatchProps {
  name: ThemeName
  active: boolean
  onSelect: (name: ThemeName) => void
}

function ThemeSwatch({ name, active, onSelect }: SwatchProps) {
  const t = THEMES[name]

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={THEME_LABELS[name]}
      onClick={() => onSelect(name)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        borderRadius: 6,
        border: active ? `2px solid ${t.accent}` : `2px solid ${T.cardBorder}`,
        background: active ? t.accent : T.hover,
        color: active ? t.accentText : T.text,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        whiteSpace: 'nowrap',
        transition: 'border-color 0.12s, background 0.12s',
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: active ? t.accentText : t.accent,
        opacity: active ? 0.8 : 1,
      }} />
      {THEME_LABELS[name]}
    </button>
  )
}

interface ThemeGroupProps {
  label: string
  themes: ThemeName[]
  activeTheme: ThemeName
  onSelect: (name: ThemeName) => void
}

function ThemeGroup({ label, themes, activeTheme, onSelect }: ThemeGroupProps) {
  return (
    <div>
      <div style={{
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '.07em',
        textTransform: 'uppercase',
        color: T.textFaint,
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {themes.map(name => (
          <ThemeSwatch
            key={name}
            name={name}
            active={activeTheme === name}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

// ── SettingsContent (reusable body, no overlay shell) ─────────────────────────

export interface SettingsContentProps {
  onClose?: () => void
  showSignOut?: boolean
}

export function SettingsContent({ onClose, showSignOut }: SettingsContentProps) {
  const { theme, setTheme, density, setDensity } = useThemeStore()
  const logout = useAuthStore(s => s.logout)
  const router = useRouter()

  function handleSignOut() {
    logout()
    router.push('/login')
  }

  function handleTheme(name: ThemeName) {
    setTheme(name)
    applyTheme(name)
  }

  function handleDensity(d: DensityName) {
    setDensity(d)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h2 style={{
          margin: 0, fontSize: 16, fontWeight: 700,
          color: T.text, letterSpacing: '-.01em',
        }}>
          Settings
        </h2>
        {onClose && (
          <button
            type="button"
            aria-label="Close settings"
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: T.textMuted, display: 'inline-flex',
              alignItems: 'center', padding: 4, borderRadius: 4,
            }}
          >
            <Icon name="x" size={16} sw={2} />
          </button>
        )}
      </div>

      {/* Theme picker */}
      <section>
        <div style={{
          fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 12,
        }}>
          Theme
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ThemeGroup
            label="Classic"
            themes={CLASSIC_THEMES}
            activeTheme={theme}
            onSelect={handleTheme}
          />
          <ThemeGroup
            label="Premium Glass — Dark"
            themes={PREMIUM_DARK_THEMES}
            activeTheme={theme}
            onSelect={handleTheme}
          />
          <ThemeGroup
            label="Premium Glass — Light"
            themes={PREMIUM_LIGHT_THEMES}
            activeTheme={theme}
            onSelect={handleTheme}
          />
        </div>
      </section>

      {/* Density picker */}
      <section>
        <div style={{
          fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 12,
        }}>
          Density
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(Object.keys(DENSITY) as DensityName[]).map(d => {
            const active = density === d
            const tokens = DENSITY[d]
            return (
              <button
                key={d}
                type="button"
                aria-pressed={active}
                onClick={() => handleDensity(d)}
                style={{
                  flex: 1,
                  minWidth: 90,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: active
                    ? `2px solid ${T.accent}`
                    : `2px solid ${T.cardBorder}`,
                  background: active ? T.selectedBg : T.card,
                  color: active ? T.selectedText : T.text,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.12s, background 0.12s',
                }}
              >
                {/* Card height preview strip */}
                <div style={{
                  height: tokens.cardPad,
                  background: active ? T.accent : T.cardBorder,
                  borderRadius: 3,
                  marginBottom: 8,
                  opacity: 0.7,
                  transition: 'height 0.12s',
                }} />
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
                  {DENSITY_LABELS[d]}
                </div>
                <div style={{ fontSize: 10.5, color: active ? T.selectedText : T.textMuted, lineHeight: 1.3 }}>
                  {DENSITY_DESCRIPTIONS[d]}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Sign out — only shown when requested (e.g. from mobile nav) */}
      {showSignOut && (
        <section>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: 8,
              border: `1px solid ${T.cardBorder}`,
              background: T.card,
              color: T.textMuted,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              textAlign: 'left',
            }}
          >
            Sign out
          </button>
        </section>
      )}
    </div>
  )
}

// ── SettingsModal (overlay + focus trap) ──────────────────────────────────────

interface ModalProps {
  open: boolean
  onClose: () => void
  showSignOut?: boolean
}

export default function SettingsModal({ open, onClose, showSignOut }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Escape key closes modal
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Focus trap: on open, focus the dialog; restore focus on close
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    return () => {
      prev?.focus()
    }
  }, [open])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  return (
    // Backdrop
    <div
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        tabIndex={-1}
        style={{
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: T.card,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 16px 48px rgba(0,0,0,.35)',
          outline: 'none',
        }}
      >
        <SettingsContent onClose={onClose} showSignOut={showSignOut} />
      </div>
    </div>
  )
}
