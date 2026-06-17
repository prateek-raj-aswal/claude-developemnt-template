/**
 * test_plan:
 *   story_id: US-1821
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-001
 *       maps_to_ac: "Mobile bottom nav renders a Settings tab"
 *     - id: TC-002
 *       maps_to_ac: "Tapping Settings tab opens SettingsModal"
 *     - id: TC-003
 *       maps_to_ac: "SettingsModal on mobile includes all 20 theme swatches"
 *     - id: TC-004
 *       maps_to_ac: "SettingsModal on mobile includes 3 density buttons"
 *     - id: TC-005
 *       maps_to_ac: "SettingsModal on mobile includes a Sign out button"
 *     - id: TC-006
 *       maps_to_ac: "Tapping Sign out calls authStore.logout() and redirects to /login"
 *     - id: TC-007
 *       maps_to_ac: "Settings tab is visible only on mobile breakpoint (max-width: 767px)"
 *     - id: TC-008
 *       maps_to_ac: "Selecting a theme from mobile settings applies the theme immediately"
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks — hoisted before component imports
// ---------------------------------------------------------------------------

let mockIsMobile = true

vi.mock('@/lib/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile,
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/boards',
}))

const mockLogout = vi.fn()
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn((sel?: (s: unknown) => unknown) => {
    const state = { logout: mockLogout }
    return sel ? sel(state) : state
  }),
}))

const mockSetTheme = vi.fn()
const mockSetDensity = vi.fn()
vi.mock('@/store/themeStore', () => ({
  useThemeStore: vi.fn((sel?: (s: unknown) => unknown) => {
    const state = {
      theme: 'midnight' as const,
      density: 'comfortable' as const,
      setTheme: mockSetTheme,
      setDensity: mockSetDensity,
    }
    return sel ? sel(state) : state
  }),
}))

vi.mock('@/lib/theme', async () => {
  const actual = await vi.importActual<typeof import('@/lib/theme')>('@/lib/theme')
  return {
    ...actual,
    applyTheme: vi.fn(),
  }
})

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('@/lib/auth', () => ({
  getRefreshToken: () => null,
}))

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------
import BottomNav from '@/components/ui/BottomNav'

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
  mockIsMobile = true
  mockLogout.mockClear()
  mockPush.mockClear()
  mockSetTheme.mockClear()
  mockSetDensity.mockClear()
})

afterEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-001 — Mobile bottom nav renders a Settings tab
// ---------------------------------------------------------------------------
describe('TC-001: Mobile bottom nav renders a Settings tab', () => {
  it('renders a Settings tab button with a gear/settings icon', () => {
    render(<BottomNav />)
    // Settings tab should be findable by accessible name or text
    const settingsTab = screen.queryByRole('button', { name: /settings/i })
      ?? screen.queryByText(/^settings$/i)
    expect(settingsTab).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// TC-002 — Tapping Settings tab opens SettingsModal
// ---------------------------------------------------------------------------
describe('TC-002: Tapping Settings tab opens SettingsModal', () => {
  it('opens SettingsModal (role=dialog) when Settings tab is tapped', () => {
    render(<BottomNav />)
    const settingsBtn = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsBtn)
    const dialog = screen.queryByRole('dialog')
    expect(dialog).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// TC-003 — SettingsModal on mobile includes all 20 theme swatches
// ---------------------------------------------------------------------------
describe('TC-003: SettingsModal on mobile includes all 20 theme swatches', () => {
  it('renders exactly 20 theme swatch buttons inside the modal', () => {
    render(<BottomNav />)
    const settingsBtn = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsBtn)

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
// TC-004 — SettingsModal on mobile includes 3 density buttons
// ---------------------------------------------------------------------------
describe('TC-004: SettingsModal on mobile includes 3 density buttons', () => {
  it('renders Compact, Comfortable, and Spacious density buttons', () => {
    render(<BottomNav />)
    const settingsBtn = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsBtn)

    expect(screen.getByText(/compact/i)).toBeTruthy()
    expect(screen.getByText(/comfortable/i)).toBeTruthy()
    expect(screen.getByText(/spacious/i)).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// TC-005 — SettingsModal on mobile includes a Sign out button
// ---------------------------------------------------------------------------
describe('TC-005: SettingsModal on mobile includes a Sign out button', () => {
  it('renders a Sign out button inside the modal', () => {
    render(<BottomNav />)
    const settingsBtn = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsBtn)

    const signOutBtn = screen.queryByRole('button', { name: /sign out/i })
      ?? screen.queryByText(/sign out/i)
    expect(signOutBtn).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// TC-006 — Tapping Sign out calls authStore.logout() and redirects to /login
// ---------------------------------------------------------------------------
describe('TC-006: Sign out calls logout() and redirects to /login', () => {
  it('calls authStore.logout() when Sign out is clicked', () => {
    render(<BottomNav />)
    const settingsBtn = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsBtn)

    const signOutBtn = screen.getByRole('button', { name: /sign out/i })
    fireEvent.click(signOutBtn)
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('redirects to /login after Sign out is clicked', () => {
    render(<BottomNav />)
    const settingsBtn = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsBtn)

    const signOutBtn = screen.getByRole('button', { name: /sign out/i })
    fireEvent.click(signOutBtn)
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})

// ---------------------------------------------------------------------------
// TC-007 — Settings tab visible only on mobile breakpoint
// ---------------------------------------------------------------------------
describe('TC-007: Settings tab is visible only on mobile breakpoint', () => {
  it('renders BottomNav (including Settings tab) when isMobile=true', () => {
    mockIsMobile = true
    render(<BottomNav />)
    const settingsBtn = screen.queryByRole('button', { name: /settings/i })
      ?? screen.queryByText(/^settings$/i)
    expect(settingsBtn).not.toBeNull()
  })

  it('does not render BottomNav at all when isMobile=false', () => {
    mockIsMobile = false
    const { container } = render(<BottomNav />)
    expect(container.firstChild).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// TC-008 — Selecting a theme from mobile settings applies the theme immediately
// ---------------------------------------------------------------------------
describe('TC-008: Selecting a theme from mobile settings applies immediately', () => {
  it('clicking a theme swatch calls setTheme with the correct theme name', () => {
    render(<BottomNav />)
    const settingsBtn = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsBtn)

    const lightBtn = screen.getByRole('button', { name: /^light$/i })
    fireEvent.click(lightBtn)
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
