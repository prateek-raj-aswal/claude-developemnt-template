/**
 * test_plan:
 *   story_id: US-1802
 *   framework: vitest + @testing-library/react
 *   tests:
 *     - id: TC-1802-1
 *       maps_to_ac: "CardModal renders a startDate date input when card.startDate is null (empty input shown)"
 *     - id: TC-1802-2
 *       maps_to_ac: "CardModal renders a startDate date input pre-filled when card.startDate is non-null"
 *     - id: TC-1802-3
 *       maps_to_ac: "Setting startDate to a date before dueDate calls PATCH with correct payload and updates UI"
 *     - id: TC-1802-4
 *       maps_to_ac: "Setting startDate to a date after dueDate shows inline validation error and does not call PATCH"
 *     - id: TC-1802-5
 *       maps_to_ac: "Clearing startDate sends PATCH with { startDate: null }"
 *     - id: TC-1802-6
 *       maps_to_ac: "TypeScript compilation: CardResponse includes startDate and color fields without type errors"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useConfigStore } from '@/store/configStore'
import type { CardResponse } from '@/types/api'

// ── api mock ──────────────────────────────────────────────────────────────────
const mockGet = vi.fn()
const mockPatch = vi.fn()

vi.mock('@/lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn().mockResolvedValue({}),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: vi.fn().mockResolvedValue({}),
    postForm: vi.fn().mockResolvedValue({}),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, public code: string, message: string) { super(message) }
  },
}))

vi.mock('@/lib/theme', () => ({
  T: new Proxy({}, { get: (_t, prop) => String(prop) }),
  darkenHex: (hex: string) => hex,
}))

vi.mock('@/components/ui/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

vi.mock('@/lib/useIsMobile', () => ({ useIsMobile: () => false }))

// ── Component import (after mocks) ───────────────────────────────────────────
import CardModal from '@/components/board/CardModal'

function makeCard(overrides: Partial<CardResponse> = {}): CardResponse {
  return {
    id: 'card-1',
    columnId: 'col-1',
    title: 'Test Card',
    description: null,
    position: 1000,
    startDate: null,
    dueDate: null,
    priority: 'NONE',
    labels: [],
    assignees: [],
    color: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGet.mockResolvedValue([])
  mockPatch.mockResolvedValue({})
  useConfigStore.setState({ columnColors: [], columnColorMap: {} })
})

function renderModal(card = makeCard()) {
  return render(
    <CardModal
      card={card}
      columnName="Backlog"
      boardId="board-1"
      onClose={vi.fn()}
      onUpdate={vi.fn()}
      onDelete={vi.fn()}
    />
  )
}

// ── TC-1802-1: startDate input renders empty when card.startDate is null ──────
describe('TC-1802-1: startDate input renders empty when card has no startDate', () => {
  it('renders a start date input with empty value when card.startDate is null', () => {
    renderModal(makeCard({ startDate: null }))

    const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement
    expect(startDateInput).toBeInTheDocument()
    expect(startDateInput.type).toBe('date')
    expect(startDateInput.value).toBe('')
  })
})

// ── TC-1802-2: startDate input pre-filled when card has a startDate ───────────
describe('TC-1802-2: startDate input pre-filled when card.startDate is non-null', () => {
  it('renders start date input pre-filled with ISO date when card.startDate is set', () => {
    renderModal(makeCard({ startDate: '2026-07-01' }))

    const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement
    expect(startDateInput).toBeInTheDocument()
    expect(startDateInput.type).toBe('date')
    expect(startDateInput.value).toBe('2026-07-01')
  })
})

// ── TC-1802-3: valid startDate (before dueDate) calls PATCH ───────────────────
describe('TC-1802-3: startDate before dueDate calls PATCH with correct payload', () => {
  it('calls PATCH /api/v1/cards/{id} with startDate when startDate < dueDate', async () => {
    mockPatch.mockResolvedValue({})
    renderModal(makeCard({ dueDate: '2026-08-01' }))

    const startDateInput = screen.getByLabelText(/start date/i)
    fireEvent.change(startDateInput, { target: { value: '2026-07-01' } })

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/cards/card-1',
        expect.objectContaining({ startDate: '2026-07-01' })
      )
    })

    // No inline error shown
    expect(screen.queryByText(/start date must be before/i)).not.toBeInTheDocument()
  })
})

// ── TC-1802-4: startDate after dueDate shows validation error, no PATCH ───────
describe('TC-1802-4: startDate after dueDate shows inline error, does not PATCH', () => {
  it('shows inline validation error and does not call PATCH when startDate > dueDate', async () => {
    renderModal(makeCard({ dueDate: '2026-06-01' }))

    const startDateInput = screen.getByLabelText(/start date/i)
    fireEvent.change(startDateInput, { target: { value: '2026-07-01' } })

    await waitFor(() => {
      expect(screen.getByText(/start date must be before or equal to due date/i)).toBeInTheDocument()
    })

    // PATCH must NOT be called
    expect(mockPatch).not.toHaveBeenCalledWith(
      '/api/v1/cards/card-1',
      expect.objectContaining({ startDate: expect.anything() })
    )
  })
})

// ── TC-1802-5: clearing startDate sends PATCH with null ───────────────────────
describe('TC-1802-5: Clearing startDate sends PATCH with { startDate: null }', () => {
  it('calls PATCH with startDate: null when startDate input is cleared', async () => {
    mockPatch.mockResolvedValue({})
    renderModal(makeCard({ startDate: '2026-07-01' }))

    const startDateInput = screen.getByLabelText(/start date/i)
    fireEvent.change(startDateInput, { target: { value: '' } })

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/cards/card-1',
        expect.objectContaining({ startDate: null })
      )
    })
  })
})

// ── TC-1802-6: TypeScript type check — CardResponse has startDate and color ───
describe('TC-1802-6: CardResponse type includes startDate and color fields', () => {
  it('CardResponse type has startDate?: string | null and color?: string | null', () => {
    // This is a compile-time check expressed as a runtime assertion.
    // If either field is missing from the type, TypeScript will error at compile time.
    const card: CardResponse = {
      id: 'c1',
      columnId: 'col-1',
      title: 'Type check card',
      description: null,
      position: 1,
      startDate: '2026-07-01',
      dueDate: null,
      priority: 'NONE',
      labels: [],
      assignees: [],
      color: '#ff0000',
    }

    expect(card.startDate).toBe('2026-07-01')
    expect(card.color).toBe('#ff0000')

    // Also check null assignments are valid
    const card2: CardResponse = { ...card, startDate: null, color: null }
    expect(card2.startDate).toBeNull()
    expect(card2.color).toBeNull()
  })
})
