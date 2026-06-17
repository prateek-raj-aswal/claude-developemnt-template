/**
 * test_plan:
 *   story_id: US-1814
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-001
 *       maps_to_ac: "SettingsModal renders 20 theme swatches"
 *     - id: TC-002
 *       maps_to_ac: "Active theme swatch has ring indicator"
 *     - id: TC-003
 *       maps_to_ac: "Clicking a theme swatch calls themeStore.setTheme with the correct theme name"
 *     - id: TC-004
 *       maps_to_ac: "SettingsModal renders 3 density buttons: Compact, Comfortable, Spacious"
 *     - id: TC-005
 *       maps_to_ac: "Active density button is highlighted"
 *     - id: TC-006
 *       maps_to_ac: "Clicking Compact calls themeStore.setDensity('compact')"
 *     - id: TC-007
 *       maps_to_ac: "Escape key closes the modal"
 *     - id: TC-008
 *       maps_to_ac: "Outside-click closes modal"
 *     - id: TC-009
 *       maps_to_ac: "SettingsModal is accessible: role=dialog, aria-modal=true"
 *     - id: TC-010
 *       maps_to_ac: "Sidebar renders a settings button that opens SettingsModal"
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks — must be hoisted before component imports
// ---------------------------------------------------------------------------

const mockSetTheme = vi.fn()
const mockSetDensity = vi.fn()

vi.mock('@/store/themeStore', () => ({
  useThemeStore: vi.fn((selector?: (s: unknown) => unknown) => {
    const state = {
      theme: 'midnight' as const,
      density: 'comfortable' as const,
      setTheme: mockSetTheme,
      setDensity: mockSetDensity,
    }
    return selector ? selector(state) : state
  }),
}))

// Mock applyTheme — it accesses document.documentElement which is available in jsdom,
// but we don't want real CSS var side-effects in unit tests.
vi.mock('@/lib/theme', async () => {
  const actual = await vi.importActual<typeof import('@/lib/theme')>('@/lib/theme')
  return {
    ...actual,
    applyTheme: vi.fn(),
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/boards',
}))

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('@/components/ui/ThemeSwitcher', () => ({ default: () => null }))
vi.mock('@/components/ui/NotificationPanel', () => ({ default: () => null }))
vi.mock('@/components/board/WorkspaceSwitcher', () => ({ default: () => null }))
vi.mock('@/lib/useIsMobile', () => ({ useIsMobile: () => false }))
vi.mock('@/lib/auth', () => ({ getRefreshToken: () => null }))

vi.mock('@/store/sidebarStore', () => ({
  useSidebarStore: vi.fn(() => ({ collapsed: false, setCollapsed: vi.fn() })),
}))

vi.mock('@/store/workspaceStore', () => ({
  useWorkspaceStore: vi.fn(() => ({
    workspaces: [],
    activeWorkspaceId: null,
    setWorkspaces: vi.fn(),
  })),
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn((sel?: (s: unknown) => unknown) => {
    const state = { logout: vi.fn() }
    return sel ? sel(state) : state
  }),
}))

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------
import SettingsModal from '@/components/ui/SettingsModal'
import Sidebar from '@/components/board/Sidebar'

const ALL_THEME_LABELS = [
  'Light', 'Midnight', 'Graphite', 'Ocean', 'Sunset', 'Forest',
  'Indigo Night', 'Indigo Day',
  'Emerald Night', 'Emerald Day',
  'Ocean Night', 'Ocean Day',
  'Violet Night', 'Violet Day',
  'Sunset Night', 'Sunset Day',
  'Rose Night', 'Rose Day',
  'Steel Night', 'Steel Day',
]

beforeEach(() => {
  mockSetTheme.mockClear()
  mockSetDensity.mockClear()
})

afterEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-001 — SettingsModal renders 20 theme swatches
// ---------------------------------------------------------------------------
describe('TC-001: SettingsModal renders 20 theme swatches', () => {
  it('renders exactly 20 theme swatch buttons', () => {
    render(<SettingsModal open={true} onClose={() => {}} />)

    // Each swatch button has aria-label equal to the theme display name
    const foundLabels = ALL_THEME_LABELS.filter(label => {
      try {
        screen.getByRole('button', { name: new RegExp(`^${label}$`, 'i') })
        return true
      } catch {
        return false
      }
    })
    expect(foundLabels.length).toBe(20)
  })
})

// ---------------------------------------------------------------------------
// TC-002 — Active theme swatch has ring/indicator
// ---------------------------------------------------------------------------
describe('TC-002: Active theme swatch has ring indicator', () => {
  it('the active theme button (midnight) has aria-pressed=true', () => {
    render(<SettingsModal open={true} onClose={() => {}} />)
    // theme is mocked to 'midnight'
    const midnightBtn = screen.getByRole('button', { name: /midnight/i })
    expect(midnightBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('non-active theme buttons have aria-pressed=false', () => {
    render(<SettingsModal open={true} onClose={() => {}} />)
    const lightBtn = screen.getByRole('button', { name: /^light$/i })
    expect(lightBtn).toHaveAttribute('aria-pressed', 'false')
  })
})

// ---------------------------------------------------------------------------
// TC-003 — Clicking a theme swatch calls setTheme with correct name
// ---------------------------------------------------------------------------
describe('TC-003: Clicking a theme swatch calls themeStore.setTheme', () => {
  it('clicking "Light" swatch calls setTheme("light")', () => {
    render(<SettingsModal open={true} onClose={() => {}} />)
    const lightBtn = screen.getByRole('button', { name: /^light$/i })
    fireEvent.click(lightBtn)
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('clicking "Indigo Night" swatch calls setTheme("indigo-night")', () => {
    render(<SettingsModal open={true} onClose={() => {}} />)
    const indigoBtn = screen.getByRole('button', { name: /indigo night/i })
    fireEvent.click(indigoBtn)
    expect(mockSetTheme).toHaveBeenCalledWith('indigo-night')
  })
})

// ---------------------------------------------------------------------------
// TC-004 — SettingsModal renders 3 density buttons
// ---------------------------------------------------------------------------
describe('TC-004: SettingsModal renders 3 density buttons', () => {
  it('renders Compact, Comfortable, and Spacious buttons', () => {
    render(<SettingsModal open={true} onClose={() => {}} />)
    expect(screen.getByText(/compact/i)).toBeTruthy()
    expect(screen.getByText(/comfortable/i)).toBeTruthy()
    expect(screen.getByText(/spacious/i)).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// TC-005 — Active density button is highlighted
// ---------------------------------------------------------------------------
describe('TC-005: Active density button is highlighted', () => {
  it('the active density button (comfortable) has aria-pressed=true', () => {
    render(<SettingsModal open={true} onClose={() => {}} />)
    // Find density buttons by checking aria-pressed on buttons near density text
    // The density buttons use aria-pressed
    const densityBtns = screen.getAllByRole('button', { pressed: true })
    // midnight swatch is also pressed=true; comfortable button should also be pressed=true
    const labels = densityBtns.map(b => b.textContent?.toLowerCase() || b.getAttribute('aria-label')?.toLowerCase() || '')
    const hasComfortable = labels.some(l => l.includes('comfortable'))
    expect(hasComfortable).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// TC-006 — Clicking density button calls setDensity
// ---------------------------------------------------------------------------
describe('TC-006: Clicking Compact calls themeStore.setDensity("compact")', () => {
  it('clicking Compact density button calls setDensity with compact', () => {
    render(<SettingsModal open={true} onClose={() => {}} />)
    // Find the button containing "Compact" text
    const allButtons = screen.getAllByRole('button')
    const compactBtn = allButtons.find(b => b.textContent?.toLowerCase().includes('compact'))
    expect(compactBtn).toBeTruthy()
    fireEvent.click(compactBtn!)
    expect(mockSetDensity).toHaveBeenCalledWith('compact')
  })

  it('clicking Spacious density button calls setDensity with spacious', () => {
    render(<SettingsModal open={true} onClose={() => {}} />)
    const allButtons = screen.getAllByRole('button')
    const spaciousBtn = allButtons.find(b => b.textContent?.toLowerCase().includes('spacious'))
    expect(spaciousBtn).toBeTruthy()
    fireEvent.click(spaciousBtn!)
    expect(mockSetDensity).toHaveBeenCalledWith('spacious')
  })
})

// ---------------------------------------------------------------------------
// TC-007 — Escape key closes the modal
// ---------------------------------------------------------------------------
describe('TC-007: Escape key closes the modal', () => {
  it('pressing Escape calls onClose', () => {
    const onClose = vi.fn()
    render(<SettingsModal open={true} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// TC-008 — Outside-click closes modal
// ---------------------------------------------------------------------------
describe('TC-008: Outside-click closes modal', () => {
  it('clicking the backdrop calls onClose', () => {
    const onClose = vi.fn()
    render(<SettingsModal open={true} onClose={onClose} />)
    // The backdrop is the role="presentation" div
    const backdrop = document.querySelector('[role="presentation"]')
    expect(backdrop).not.toBeNull()
    fireEvent.click(backdrop!, { target: backdrop })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// TC-009 — Accessibility: role=dialog, aria-modal=true
// ---------------------------------------------------------------------------
describe('TC-009: SettingsModal is accessible', () => {
  it('has role=dialog and aria-modal=true', () => {
    render(<SettingsModal open={true} onClose={() => {}} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeTruthy()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('has aria-label="Settings"', () => {
    render(<SettingsModal open={true} onClose={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: /settings/i })
    expect(dialog).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// TC-010 — Sidebar renders a settings button that opens SettingsModal
// ---------------------------------------------------------------------------
describe('TC-010: Sidebar has settings button that opens SettingsModal', () => {
  it('renders a settings/cog button in the sidebar', () => {
    render(<Sidebar />)

    // Settings button should be present (aria-label or title "Settings")
    const settingsBtn = screen.queryByRole('button', { name: /open settings/i })
      ?? screen.queryByTitle(/^settings$/i)
    expect(settingsBtn).not.toBeNull()
  })

  it('clicking the settings button opens SettingsModal', () => {
    render(<Sidebar />)

    const settingsBtn = screen.queryByRole('button', { name: /open settings/i })
      ?? screen.queryByTitle(/^settings$/i)
    expect(settingsBtn).not.toBeNull()

    fireEvent.click(settingsBtn!)

    // SettingsModal dialog should now appear
    const dialog = screen.queryByRole('dialog')
    expect(dialog).not.toBeNull()
  })
})
