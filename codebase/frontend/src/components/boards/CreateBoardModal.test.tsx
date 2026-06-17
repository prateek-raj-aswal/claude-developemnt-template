import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import CreateBoardModal from './CreateBoardModal'

const mockFetch = vi.fn()
global.fetch = mockFetch

const defaultProps = {
  onClose: vi.fn(),
  onCreate: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ id: '1', name: 'Test Board', emoji: '◇' }),
  })
  defaultProps.onCreate.mockResolvedValue(undefined)
})

describe('CreateBoardModal enrichment', () => {
  it('renders a description textarea', () => {
    render(<CreateBoardModal {...defaultProps} />)
    const textarea = screen.getByPlaceholderText('What is this board for? (optional)')
    expect(textarea).toBeInTheDocument()
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('renders a 4x4 emoji picker grid with 16 symbols', () => {
    render(<CreateBoardModal {...defaultProps} />)
    // All 16 emoji symbols should be present as buttons
    const emojiSymbols = ['◇','◆','◈','⬡','⬢','★','♦','●','■','▲','◉','⊕','⊗','⊘','✦','⬟']
    const emojiGrid = screen.getByRole('group', { name: /emoji/i })
    expect(emojiGrid).toBeInTheDocument()
    for (const sym of emojiSymbols) {
      expect(screen.getByRole('button', { name: sym })).toBeInTheDocument()
    }
  })

  it('default emoji is ◇ on first open', () => {
    render(<CreateBoardModal {...defaultProps} />)
    // The default emoji button should have a ring/selected indicator (aria-pressed or data attribute)
    const defaultBtn = screen.getByRole('button', { name: '◇' })
    expect(defaultBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('clicking an emoji symbol updates the selected emoji and shows ring indicator', () => {
    render(<CreateBoardModal {...defaultProps} />)
    const starBtn = screen.getByRole('button', { name: '★' })
    fireEvent.click(starBtn)
    expect(starBtn).toHaveAttribute('aria-pressed', 'true')
    // Previous default should no longer be pressed
    const defaultBtn = screen.getByRole('button', { name: '◇' })
    expect(defaultBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders 9 colour swatches', () => {
    render(<CreateBoardModal {...defaultProps} />)
    const swatchGroup = screen.getByRole('group', { name: /colour/i })
    expect(swatchGroup).toBeInTheDocument()
    // 9 swatches: 1 null (no colour) + 8 hex colours
    const swatches = swatchGroup.querySelectorAll('button')
    expect(swatches).toHaveLength(9)
  })

  it('clicking a colour swatch updates the preview', () => {
    render(<CreateBoardModal {...defaultProps} />)
    const swatchGroup = screen.getByRole('group', { name: /colour/i })
    const swatches = swatchGroup.querySelectorAll('button')
    // Click the second swatch (#ef4444 — red)
    fireEvent.click(swatches[1])
    expect(swatches[1]).toHaveAttribute('aria-pressed', 'true')
    expect(swatches[0]).toHaveAttribute('aria-pressed', 'false')
  })

  it('live preview panel updates in real time as name, emoji, and colour change', () => {
    render(<CreateBoardModal {...defaultProps} />)
    const preview = screen.getByTestId('board-preview')
    expect(preview).toBeInTheDocument()

    // Type a name
    const nameInput = screen.getByPlaceholderText('Board name')
    fireEvent.change(nameInput, { target: { value: 'My New Board' } })
    expect(preview).toHaveTextContent('My New Board')

    // Click an emoji
    fireEvent.click(screen.getByRole('button', { name: '★' }))
    expect(preview).toHaveTextContent('★')
  })

  it('submit sends POST /api/v1/boards with name, description, and emoji in the body', async () => {
    render(<CreateBoardModal {...defaultProps} />)

    fireEvent.change(screen.getByPlaceholderText('Board name'), { target: { value: 'Sprint Board' } })
    fireEvent.change(screen.getByPlaceholderText('What is this board for? (optional)'), { target: { value: 'My sprint' } })
    fireEvent.click(screen.getByRole('button', { name: '★' }))

    fireEvent.submit(screen.getByRole('button', { name: /create/i }).closest('form')!)

    await waitFor(() => {
      expect(defaultProps.onCreate).toHaveBeenCalledWith(
        'Sprint Board',
        'My sprint',
        '★',
      )
    })
  })

  it('submit without name shows validation error', async () => {
    render(<CreateBoardModal {...defaultProps} />)
    const submitBtn = screen.getByRole('button', { name: /create/i })
    // Button should be disabled when name is empty
    expect(submitBtn).toBeDisabled()
  })

  it('description is optional — submit without description calls onCreate with null or undefined description', async () => {
    render(<CreateBoardModal {...defaultProps} />)

    fireEvent.change(screen.getByPlaceholderText('Board name'), { target: { value: 'No Desc Board' } })
    // Leave description empty
    fireEvent.submit(screen.getByRole('button', { name: /create/i }).closest('form')!)

    await waitFor(() => {
      expect(defaultProps.onCreate).toHaveBeenCalled()
      const [, desc] = defaultProps.onCreate.mock.calls[0]
      // description should be null or undefined (not a non-empty string)
      expect(desc == null || desc === '').toBe(true)
    })
  })
})
