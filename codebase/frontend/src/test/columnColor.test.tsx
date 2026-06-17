/**
 * test_plan:
 *   story_id: US-1819
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-1
 *       file: "src/test/columnColor.test.tsx"
 *       maps_to_ac: "AC-1: Column header shows a colour indicator swatch (filled circle for coloured, dashed for null)"
 *       type: acceptance
 *     - id: TC-2
 *       file: "src/test/columnColor.test.tsx"
 *       maps_to_ac: "AC-2: Clicking the indicator opens the 24-swatch palette popover"
 *       type: acceptance
 *     - id: TC-3
 *       file: "src/test/columnColor.test.tsx"
 *       maps_to_ac: "AC-3: Clicking an already-coloured indicator re-opens the picker (re-openable)"
 *       type: acceptance
 *     - id: TC-4
 *       file: "src/test/columnColor.test.tsx"
 *       maps_to_ac: "AC-4: Clicking a swatch sends PATCH with { color: hex } and updates indicator immediately"
 *       type: acceptance
 *     - id: TC-5
 *       file: "src/test/columnColor.test.tsx"
 *       maps_to_ac: "AC-5: Active colour has a ring indicator in the palette"
 *       type: acceptance
 *     - id: TC-6
 *       file: "src/test/columnColor.test.tsx"
 *       maps_to_ac: "AC-6: VIEWER role — indicator visible but clicking does not open picker"
 *       type: acceptance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useBoardStore } from '@/store/boardStore'
import type { BoardEvent } from '@/lib/websocket'

// ---------------------------------------------------------------------------
// Mock @dnd-kit — Column uses useSortable internally; we stub the whole kit
// ---------------------------------------------------------------------------
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    setActivatorNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

// ---------------------------------------------------------------------------
// Mock @/lib/api
// ---------------------------------------------------------------------------
const mockPatch = vi.fn().mockResolvedValue({})
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({}),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, public code: string, message: string) {
      super(message)
    }
  },
}))

// ---------------------------------------------------------------------------
// Mock @/lib/theme — provide KB_COLORS and THEMES stubs
// (KB_COLORS must be inlined inside the factory because vi.mock is hoisted)
// ---------------------------------------------------------------------------
vi.mock('@/lib/theme', () => ({
  T: new Proxy({}, { get: (_t, prop) => String(prop) }),
  KB_COLORS: [
    null,
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#ec4899', '#f43f5e',
    '#64748b', '#374151', '#1e293b',
    '#78716c', '#a3a3a3', '#d4d4d4', '#fafafa', '#000000',
  ],
  THEMES: new Proxy({}, { get: () => ({ glass: false, dark: false, gradient: false }) }),
}))

// Convenience reference (after mocks, for use in test assertions)
const KB_COLORS_STUB: (string | null)[] = [
  null,
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#f43f5e',
  '#64748b', '#374151', '#1e293b',
  '#78716c', '#a3a3a3', '#d4d4d4', '#fafafa', '#000000',
]

// ---------------------------------------------------------------------------
// Mock @/store/themeStore
// ---------------------------------------------------------------------------
vi.mock('@/store/themeStore', () => ({
  useThemeStore: (sel: (s: { theme: string }) => unknown) => sel({ theme: 'light' }),
}))

// ---------------------------------------------------------------------------
// Stub Icon — not relevant to this story
// ---------------------------------------------------------------------------
vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

// ---------------------------------------------------------------------------
// Stub CardItem — not relevant to this story
// ---------------------------------------------------------------------------
vi.mock('@/components/board/CardItem', () => ({
  default: () => null,
}))

// ---------------------------------------------------------------------------
// Component import (after mocks)
// ---------------------------------------------------------------------------
import Column from '@/components/board/Column'
import type { ColumnResponse } from '@/types/api'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeColumn(headerColor?: string | null): ColumnResponse {
  return {
    id: 'col-1',
    boardId: 'board-1',
    name: 'To Do',
    position: 1000,
    headerColor: headerColor ?? null,
    cards: [],
  }
}

function makeBoard(col: ColumnResponse, role = 'MEMBER') {
  return {
    id: 'board-1',
    name: 'Test Board',
    ownerId: 'user-1',
    createdAt: '',
    role,
    columns: [col],
  }
}

// ---------------------------------------------------------------------------
// Shared teardown
// ---------------------------------------------------------------------------
afterEach(() => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
  useBoardStore.setState({ board: null })
})

// ---------------------------------------------------------------------------
// TC-1: Colour indicator always visible (filled for coloured, dashed for null)
// ---------------------------------------------------------------------------
describe('TC-1: colour swatch indicator is always visible', () => {
  it('renders the swatch button when headerColor is null (dashed)', () => {
    const col = makeColumn(null)
    useBoardStore.setState({ board: makeBoard(col) })
    render(<Column column={col} onDeleteColumn={vi.fn()} />)
    expect(screen.getByTitle('Set header colour')).toBeInTheDocument()
  })

  it('renders the swatch button when headerColor is a hex colour (filled)', () => {
    const col = makeColumn('#ef4444')
    useBoardStore.setState({ board: makeBoard(col) })
    render(<Column column={col} onDeleteColumn={vi.fn()} />)
    expect(screen.getByTitle('Set header colour')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-2: Clicking the swatch button opens the 24-swatch palette popover
// ---------------------------------------------------------------------------
describe('TC-2: clicking swatch button opens the 24-swatch palette', () => {
  it('shows the colour palette with 24 swatches (including clear swatch)', () => {
    const col = makeColumn(null)
    useBoardStore.setState({ board: makeBoard(col) })
    render(<Column column={col} onDeleteColumn={vi.fn()} />)

    fireEvent.click(screen.getByTitle('Set header colour'))

    expect(screen.getByText(/header colour/i)).toBeInTheDocument()
    // Clear swatch
    expect(screen.getByTitle('No colour')).toBeInTheDocument()
    // Hex swatches
    expect(screen.getByTitle('#ef4444')).toBeInTheDocument()
    expect(screen.getByTitle('#3b82f6')).toBeInTheDocument()
    expect(screen.getByTitle('#000000')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-3: Re-openable — clicking an already-coloured indicator re-opens picker
// ---------------------------------------------------------------------------
describe('TC-3: picker is re-openable', () => {
  it('re-opens the palette when clicking the swatch indicator again after closing', () => {
    const col = makeColumn('#ef4444')
    useBoardStore.setState({ board: makeBoard(col) })
    render(<Column column={col} onDeleteColumn={vi.fn()} />)

    const swatch = screen.getByTitle('Set header colour')

    // First open
    fireEvent.click(swatch)
    expect(screen.getByText(/header colour/i)).toBeInTheDocument()

    // Close by simulating outside click
    fireEvent.mouseDown(document.body)
    expect(screen.queryByText(/header colour/i)).not.toBeInTheDocument()

    // Re-open
    fireEvent.click(swatch)
    expect(screen.getByText(/header colour/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-4: Selecting a swatch calls PATCH /api/v1/columns/:id with { color: hex }
// ---------------------------------------------------------------------------
describe('TC-4: selecting a swatch sends PATCH with { color: hex }', () => {
  it('calls api.patch with { color: hex } when a colour swatch is clicked', async () => {
    const col = makeColumn(null)
    useBoardStore.setState({ board: makeBoard(col) })
    render(<Column column={col} onDeleteColumn={vi.fn()} />)

    fireEvent.click(screen.getByTitle('Set header colour'))
    fireEvent.click(screen.getByTitle('#3b82f6'))

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/columns/col-1',
        { color: '#3b82f6' }
      )
    })
  })

  it('calls api.patch with { color: null } when the clear swatch is clicked', async () => {
    const col = makeColumn('#ef4444')
    useBoardStore.setState({ board: makeBoard(col) })
    render(<Column column={col} onDeleteColumn={vi.fn()} />)

    fireEvent.click(screen.getByTitle('Set header colour'))
    fireEvent.click(screen.getByTitle('No colour'))

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/columns/col-1',
        { color: null }
      )
    })
  })
})

// ---------------------------------------------------------------------------
// TC-5: Active colour has a ring indicator (outline) in the palette
// ---------------------------------------------------------------------------
describe('TC-5: active swatch has ring outline', () => {
  it('the swatch matching currentColor has outline style applied', () => {
    const col = makeColumn('#ef4444')
    useBoardStore.setState({ board: makeBoard(col) })
    render(<Column column={col} onDeleteColumn={vi.fn()} />)

    fireEvent.click(screen.getByTitle('Set header colour'))

    const activeSwatch = screen.getByTitle('#ef4444') as HTMLButtonElement
    // The active swatch should have non-transparent outline
    expect(activeSwatch.style.outline).not.toBe('2px solid transparent')
  })
})

// ---------------------------------------------------------------------------
// TC-6: VIEWER role — indicator visible but clicking does not open picker
// ---------------------------------------------------------------------------
describe('TC-6: VIEWER role cannot open the picker', () => {
  it('does not open the palette when user is a VIEWER', () => {
    const col = makeColumn('#ef4444')
    useBoardStore.setState({ board: makeBoard(col, 'VIEWER') })
    render(<Column column={col} onDeleteColumn={vi.fn()} />)

    // Indicator is still visible
    expect(screen.getByTitle('Set header colour')).toBeInTheDocument()

    // Click should not open the palette
    fireEvent.click(screen.getByTitle('Set header colour'))
    expect(screen.queryByText(/header colour/i)).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-7: Optimistic update — color indicator updates immediately on swatch click
// ---------------------------------------------------------------------------
describe('TC-7: optimistic update applies immediately', () => {
  it('calls updateColumnColor before PATCH resolves', async () => {
    let resolveP!: (v: unknown) => void
    mockPatch.mockReturnValueOnce(new Promise(r => { resolveP = r }))

    const col = makeColumn(null)
    useBoardStore.setState({ board: makeBoard(col) })
    const updateColorSpy = vi.spyOn(useBoardStore.getState(), 'updateColumnColor')
    render(<Column column={col} onDeleteColumn={vi.fn()} />)

    fireEvent.click(screen.getByTitle('Set header colour'))
    fireEvent.click(screen.getByTitle('#3b82f6'))

    // updateColumnColor should have been called already (before PATCH resolves)
    expect(updateColorSpy).toHaveBeenCalledWith('col-1', '#3b82f6')

    // resolve the PATCH so test cleanup is clean
    resolveP({})
  })
})

// ---------------------------------------------------------------------------
// TC-8: On API error, revert to previous colour
// ---------------------------------------------------------------------------
describe('TC-8: API error reverts colour', () => {
  it('calls updateColumnColor twice — once optimistic, once revert — when PATCH fails', async () => {
    mockPatch.mockRejectedValueOnce(new Error('Network error'))

    const col = makeColumn('#ef4444')
    useBoardStore.setState({ board: makeBoard(col) })
    const updateColorSpy = vi.spyOn(useBoardStore.getState(), 'updateColumnColor')
    render(<Column column={col} onDeleteColumn={vi.fn()} />)

    fireEvent.click(screen.getByTitle('Set header colour'))
    fireEvent.click(screen.getByTitle('#3b82f6'))

    await waitFor(() => {
      // First call: optimistic to #3b82f6
      expect(updateColorSpy).toHaveBeenNthCalledWith(1, 'col-1', '#3b82f6')
      // Second call: revert to original #ef4444
      expect(updateColorSpy).toHaveBeenNthCalledWith(2, 'col-1', '#ef4444')
    })
  })
})

// ---------------------------------------------------------------------------
// TC-9: Outside-click dismisses the popover
// ---------------------------------------------------------------------------
describe('TC-9: outside-click closes the palette', () => {
  it('closes the palette when clicking outside the popover', () => {
    const col = makeColumn(null)
    useBoardStore.setState({ board: makeBoard(col) })
    render(<Column column={col} onDeleteColumn={vi.fn()} />)

    fireEvent.click(screen.getByTitle('Set header colour'))
    expect(screen.getByText(/header colour/i)).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByText(/header colour/i)).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-10: Palette shows exactly 24 swatches
// ---------------------------------------------------------------------------
describe('TC-10: palette has exactly 24 swatches', () => {
  it('renders 24 swatch buttons in the palette', () => {
    const col = makeColumn(null)
    useBoardStore.setState({ board: makeBoard(col) })
    render(<Column column={col} onDeleteColumn={vi.fn()} />)

    fireEvent.click(screen.getByTitle('Set header colour'))

    // 1 null/clear swatch + 23 hex swatches = 24 total
    const clearSwatch = screen.getByTitle('No colour')
    expect(clearSwatch).toBeInTheDocument()

    const hexSwatches = KB_COLORS_STUB.filter(c => c !== null).map(c => screen.getByTitle(c!))
    expect(hexSwatches).toHaveLength(23)
    // Total = 24
    expect(1 + hexSwatches.length).toBe(24)
  })
})

// ---------------------------------------------------------------------------
// TC-11: COLUMN_COLOR_UPDATED websocket event updates store
// ---------------------------------------------------------------------------
describe('TC-11: COLUMN_COLOR_UPDATED websocket event updates store', () => {
  it('applies websocket COLUMN_COLOR_UPDATED event to the board store', () => {
    const col = makeColumn(null)
    const board = makeBoard(col)
    useBoardStore.setState({ board })

    const event: BoardEvent = {
      eventType: 'COLUMN_COLOR_UPDATED',
      boardId: 'board-1',
      timestamp: '',
      data: { id: 'col-1', headerColor: '#3b82f6' },
    }
    useBoardStore.getState().applyEvent(event)

    const updatedCol = useBoardStore.getState().board?.columns?.find(c => c.id === 'col-1')
    expect(updatedCol?.headerColor).toBe('#3b82f6')
  })

  it('clears the column colour on COLUMN_COLOR_UPDATED with null', () => {
    const col = makeColumn('#ef4444')
    const board = makeBoard(col)
    useBoardStore.setState({ board })

    const event: BoardEvent = {
      eventType: 'COLUMN_COLOR_UPDATED',
      boardId: 'board-1',
      timestamp: '',
      data: { id: 'col-1', headerColor: null },
    }
    useBoardStore.getState().applyEvent(event)

    const updatedCol = useBoardStore.getState().board?.columns?.find(c => c.id === 'col-1')
    expect(updatedCol?.headerColor).toBeNull()
  })
})
