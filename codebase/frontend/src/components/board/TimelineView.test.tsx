/**
 * test_plan:
 *   story_id: US-1820
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-1820-01
 *       maps_to_ac: "TimelineView fetches GET /api/v1/boards/{boardId}/cards/timeline on mount"
 *     - id: TC-1820-02
 *       maps_to_ac: "Timeline renders a CSS grid with 200px first column and 28px day columns"
 *     - id: TC-1820-03
 *       maps_to_ac: "Cards are grouped into swimlanes by columnName"
 *     - id: TC-1820-04
 *       maps_to_ac: "Cards without startDate AND dueDate appear in the 'No dates' swimlane"
 *     - id: TC-1820-05
 *       maps_to_ac: "Today-line renders at the correct day offset"
 *     - id: TC-1820-06
 *       maps_to_ac: "Weekend columns have background shading"
 *     - id: TC-1820-07
 *       maps_to_ac: "Card bars have correct left offset and width based on startDate and dueDate"
 *     - id: TC-1820-08
 *       maps_to_ac: "Clicking a card bar opens CardModal"
 *     - id: TC-1820-09
 *       maps_to_ac: "Dragging the right edge of a bar optimistically updates dueDate"
 *     - id: TC-1820-10
 *       maps_to_ac: "On mouseup, PATCH /api/v1/cards/{id}/dates is called"
 *     - id: TC-1820-11
 *       maps_to_ac: "On 422 error, dates revert to previous values"
 *     - id: TC-1820-12
 *       maps_to_ac: "Timeline is horizontally scrollable"
 *     - id: TC-1820-13
 *       maps_to_ac: "Loading state renders spinner; error state renders error message"
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import type { TimelineCardResponse } from '@/types/api'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockGet = vi.fn()
const mockPatch = vi.fn()

vi.mock('@/lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn().mockResolvedValue({}),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: vi.fn().mockResolvedValue({}),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, public code: string, message: string) {
      super(message)
    }
  },
}))

vi.mock('@/lib/theme', () => ({
  T: new Proxy({}, { get: (_t, prop) => String(prop) }),
  darkenHex: (hex: string) => hex,
}))

vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

vi.mock('@/components/board/Sidebar', () => ({
  default: () => null,
}))

vi.mock('@/lib/auth', () => ({
  getToken: vi.fn().mockReturnValue('test-jwt'),
}))

// CardModal stub — captures the cardId it was opened with
let lastModalCardId: string | null = null
vi.mock('@/components/board/CardModal', () => ({
  default: ({ card, onClose }: { card: { id: string }; onClose: () => void }) => {
    lastModalCardId = card.id
    return <div data-testid="card-modal" data-card-id={card.id} />
  },
}))

// ── Helpers ────────────────────────────────────────────────────────────────────

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

const DAY_W = 28

// Fixed "today" for deterministic tests
const TODAY = new Date('2026-06-15T00:00:00.000Z')
// dateFrom = today - 30d
const DATE_FROM = addDays(TODAY, -30) // 2026-05-16

function makeCard(overrides: Partial<TimelineCardResponse> = {}): TimelineCardResponse {
  return {
    id: 'c1',
    title: 'Card One',
    columnId: 'col-1',
    columnName: 'Todo',
    startDate: isoDate(TODAY), // today
    dueDate: isoDate(addDays(TODAY, 5)),
    priority: 'MEDIUM',
    assignees: [],
    ...overrides,
  }
}

// ── Component import ──────────────────────────────────────────────────────────
import TimelineView from './TimelineView'

// ── Setup/teardown ────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  lastModalCardId = null
  // Default happy-path response
  mockGet.mockResolvedValue({ items: [makeCard()] })
  mockPatch.mockResolvedValue({ startDate: isoDate(TODAY), dueDate: isoDate(addDays(TODAY, 10)) })

  // Freeze Date to 2026-06-15 for determinism
  vi.setSystemTime(TODAY)
})

afterEach(() => {
  vi.useRealTimers()
})

// Helper to render
function renderTimeline(boardId = 'board-1') {
  return render(<TimelineView boardId={boardId} />)
}

// ─────────────────────────────────────────────────────────────────────────────
// TC-1820-01: fetches the timeline endpoint on mount
// ─────────────────────────────────────────────────────────────────────────────
describe('TC-1820-01: fetches GET /timeline on mount', () => {
  it('calls the timeline API with from/to query params on mount', async () => {
    renderTimeline('board-99')
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/boards/board-99/timeline')
      )
    })
    const url: string = mockGet.mock.calls[0][0]
    expect(url).toContain('from=')
    expect(url).toContain('to=')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TC-1820-02: CSS grid – 200px left panel + 28px day columns
// ─────────────────────────────────────────────────────────────────────────────
describe('TC-1820-02: renders CSS grid with correct column widths', () => {
  it('renders the left panel at 200px and day columns at 28px', async () => {
    renderTimeline()
    await waitFor(() => expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument())

    const panel = screen.getByTestId('left-panel')
    expect(panel).toBeInTheDocument()
    // Inline style width should be 200px
    expect(panel).toHaveStyle({ width: '200px' })

    // At least one day column should exist
    const firstDayCol = screen.getAllByTestId(/^day-col-/)[0]
    expect(firstDayCol).toHaveStyle({ width: `${DAY_W}px` })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TC-1820-03: cards grouped into swimlanes by columnName
// ─────────────────────────────────────────────────────────────────────────────
describe('TC-1820-03: cards grouped by columnName into swimlanes', () => {
  it('renders a swimlane header for each unique columnName', async () => {
    mockGet.mockResolvedValue({
      items: [
        makeCard({ id: 'c1', title: 'Task A', columnId: 'col-1', columnName: 'Todo', startDate: isoDate(TODAY), dueDate: isoDate(addDays(TODAY, 3)) }),
        makeCard({ id: 'c2', title: 'Task B', columnId: 'col-2', columnName: 'In Progress', startDate: isoDate(TODAY), dueDate: isoDate(addDays(TODAY, 5)) }),
      ],
    })

    renderTimeline()
    await waitFor(() => expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument())

    expect(screen.getByTestId('swimlane-Todo')).toBeInTheDocument()
    expect(screen.getByTestId('swimlane-In Progress')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TC-1820-04: no-dates cards → "No dates" swimlane
// ─────────────────────────────────────────────────────────────────────────────
describe('TC-1820-04: cards with no startDate AND no dueDate appear in No dates swimlane', () => {
  it('renders a "No dates" swimlane for cards with neither date', async () => {
    mockGet.mockResolvedValue({
      items: [
        makeCard({ id: 'c-nd', title: 'Dateless Task', startDate: null, dueDate: null }),
      ],
    })

    renderTimeline()
    await waitFor(() => expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument())

    expect(screen.getByTestId('swimlane-No dates')).toBeInTheDocument()
    expect(screen.getByText('Dateless Task')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TC-1820-05: today-line at correct offset
// ─────────────────────────────────────────────────────────────────────────────
describe('TC-1820-05: today-line at correct day offset', () => {
  it('renders the today-line element', async () => {
    renderTimeline()
    await waitFor(() => expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument())

    const todayLine = screen.getByTestId('today-line')
    expect(todayLine).toBeInTheDocument()

    // today offset = 30 days from dateFrom; left = 200 + 30 * 28 = 1040px
    const expectedLeft = 200 + 30 * DAY_W
    const style = (todayLine as HTMLElement).style
    expect(style.left).toBe(`${expectedLeft}px`)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TC-1820-06: weekend shading on Sat/Sun columns
// ─────────────────────────────────────────────────────────────────────────────
describe('TC-1820-06: weekend columns have background shading', () => {
  it('renders at least one day column with weekend shading style', async () => {
    renderTimeline()
    await waitFor(() => expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument())

    // Find weekend-shaded columns
    const weekendCols = screen.getAllByTestId(/^day-col-/).filter(el =>
      (el as HTMLElement).getAttribute('data-weekend') === 'true'
    )
    expect(weekendCols.length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TC-1820-07: card bar positioned correctly based on startDate/dueDate
// ─────────────────────────────────────────────────────────────────────────────
describe('TC-1820-07: card bars have correct left offset and width', () => {
  it('positions a card bar at the correct pixel offset and width', async () => {
    // Card starts today, ends 5 days later
    const startDate = isoDate(TODAY)
    const dueDate = isoDate(addDays(TODAY, 5))
    mockGet.mockResolvedValue({
      items: [makeCard({ id: 'c1', startDate, dueDate })],
    })

    renderTimeline()
    await waitFor(() => expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument())

    const bar = screen.getByTestId('card-bar-c1')
    expect(bar).toBeInTheDocument()

    // startDate = TODAY, offset from dateFrom (today-30) = 30 days
    // bar left (within scrollable area) = 30 * 28 = 840
    // total left from component edge = 200 + 840 = 1040
    const expectedLeft = 200 + 30 * DAY_W
    const expectedWidth = (5 + 1) * DAY_W // 6 days inclusive

    const style = (bar as HTMLElement).style
    expect(style.left).toBe(`${expectedLeft}px`)
    expect(style.width).toBe(`${expectedWidth}px`)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TC-1820-08: clicking card bar opens CardModal
// ─────────────────────────────────────────────────────────────────────────────
describe('TC-1820-08: clicking card bar opens CardModal', () => {
  it('opens CardModal with the correct card when a bar is clicked', async () => {
    mockGet.mockResolvedValue({
      items: [makeCard({ id: 'c1', startDate: isoDate(TODAY), dueDate: isoDate(addDays(TODAY, 3)) })],
    })

    renderTimeline()
    await waitFor(() => expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument())

    const bar = screen.getByTestId('card-bar-c1')
    fireEvent.click(bar)

    await waitFor(() => {
      expect(screen.getByTestId('card-modal')).toBeInTheDocument()
      expect(lastModalCardId).toBe('c1')
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TC-1820-09: dragging right edge optimistically updates dueDate
// ─────────────────────────────────────────────────────────────────────────────
describe('TC-1820-09: dragging right edge optimistically updates dueDate', () => {
  it('updates the bar width during drag of the right handle', async () => {
    const startDate = isoDate(TODAY)
    const dueDate = isoDate(addDays(TODAY, 5))
    mockGet.mockResolvedValue({
      items: [makeCard({ id: 'c1', startDate, dueDate })],
    })
    mockPatch.mockResolvedValue({ startDate, dueDate: isoDate(addDays(TODAY, 8)) })

    renderTimeline()
    await waitFor(() => expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument())

    const handle = screen.getByTestId('bar-right-handle-c1')

    // Drag right by 3 days worth of pixels
    fireEvent.mouseDown(handle, { clientX: 100 })
    fireEvent.mouseMove(document, { clientX: 100 + 3 * DAY_W })

    // After mousemove, the bar width should have increased
    const bar = screen.getByTestId('card-bar-c1')
    const style = (bar as HTMLElement).style
    // new dueDate = today+5 + 3 = today+8, width = (8 - 0 + 1) * 28 = 252
    // We just check it's wider than original (6 * 28 = 168)
    const widthNum = parseInt(style.width)
    expect(widthNum).toBeGreaterThan(6 * DAY_W)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TC-1820-10: on mouseup, PATCH is called
// ─────────────────────────────────────────────────────────────────────────────
describe('TC-1820-10: on mouseup, PATCH /api/v1/cards/{id}/dates is called', () => {
  it('calls PATCH with updated dates on mouseup after drag', async () => {
    const startDate = isoDate(TODAY)
    const dueDate = isoDate(addDays(TODAY, 5))
    mockGet.mockResolvedValue({
      items: [makeCard({ id: 'c1', startDate, dueDate })],
    })
    mockPatch.mockResolvedValue({ startDate, dueDate: isoDate(addDays(TODAY, 7)) })

    renderTimeline()
    await waitFor(() => expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument())

    const handle = screen.getByTestId('bar-right-handle-c1')

    fireEvent.mouseDown(handle, { clientX: 0 })
    fireEvent.mouseMove(document, { clientX: 2 * DAY_W })
    fireEvent.mouseUp(document, { clientX: 2 * DAY_W })

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/cards/c1/dates',
        expect.objectContaining({ dueDate: expect.any(String) })
      )
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TC-1820-11: on 422 error, dates revert to previous values
// ─────────────────────────────────────────────────────────────────────────────
describe('TC-1820-11: on 422 error, dates revert', () => {
  it('reverts bar to original width when PATCH returns 422', async () => {
    const startDate = isoDate(TODAY)
    const dueDate = isoDate(addDays(TODAY, 5))
    mockGet.mockResolvedValue({
      items: [makeCard({ id: 'c1', startDate, dueDate })],
    })
    // Simulate 422 error
    const { ApiError } = await import('@/lib/api')
    mockPatch.mockRejectedValue(new ApiError(422, 'START_DATE_AFTER_DUE_DATE', 'Invalid dates'))

    renderTimeline()
    await waitFor(() => expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument())

    const originalBar = screen.getByTestId('card-bar-c1')
    const originalWidth = (originalBar as HTMLElement).style.width

    const handle = screen.getByTestId('bar-right-handle-c1')
    fireEvent.mouseDown(handle, { clientX: 0 })
    fireEvent.mouseMove(document, { clientX: 5 * DAY_W })
    fireEvent.mouseUp(document, { clientX: 5 * DAY_W })

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalled()
    })

    // After revert, the bar width should be back to the original
    await waitFor(() => {
      const bar = screen.getByTestId('card-bar-c1')
      expect((bar as HTMLElement).style.width).toBe(originalWidth)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TC-1820-12: timeline is horizontally scrollable
// ─────────────────────────────────────────────────────────────────────────────
describe('TC-1820-12: timeline is horizontally scrollable', () => {
  it('renders a container with overflow-x: auto', async () => {
    renderTimeline()
    await waitFor(() => expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument())

    const scrollContainer = screen.getByTestId('timeline-scroll-container')
    expect(scrollContainer).toBeInTheDocument()
    expect(scrollContainer).toHaveStyle({ overflowX: 'auto' })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TC-1820-13: loading and error states
// ─────────────────────────────────────────────────────────────────────────────
describe('TC-1820-13: loading state and error state', () => {
  it('renders a loading spinner while data is being fetched', () => {
    // Never resolves during this test
    mockGet.mockReturnValue(new Promise(() => {}))

    renderTimeline()

    expect(screen.getByTestId('timeline-loading')).toBeInTheDocument()
  })

  it('renders an error message when the API call fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'))

    renderTimeline()

    await waitFor(() => {
      expect(screen.getByTestId('timeline-error')).toBeInTheDocument()
    })
  })
})
