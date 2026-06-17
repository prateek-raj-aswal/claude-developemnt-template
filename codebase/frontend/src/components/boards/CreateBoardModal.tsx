'use client'
import { useState } from 'react'
import { T } from '@/lib/theme'

const EMOJI_SYMBOLS = ['◇','◆','◈','⬡','⬢','★','♦','●','■','▲','◉','⊕','⊗','⊘','✦','⬟']
const SWATCH_COLORS: (string | null)[] = [null, '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

interface Props {
  onClose: () => void
  onCreate: (name: string, description?: string | null, emoji?: string) => Promise<void>
}

export default function CreateBoardModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [emoji, setEmoji] = useState('◇')
  const [color, setColor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onCreate(name, description.trim() || null, emoji)
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    height: 38, padding: '0 12px',
    border: `1px solid ${T.cardBorder}`, borderRadius: 7,
    fontSize: 13, background: T.card, color: T.text,
    outline: 'none', width: '100%', boxSizing: 'border-box',
  }

  const textareaStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: `1px solid ${T.cardBorder}`, borderRadius: 7,
    fontSize: 13, background: T.card, color: T.text,
    outline: 'none', width: '100%', boxSizing: 'border-box',
    resize: 'vertical', minHeight: 72,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 500, color: T.text,
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: T.card, borderRadius: 12,
        border: `1px solid ${T.cardBorder}`,
        boxShadow: '0 4px 24px rgba(15,23,42,.12)',
        padding: '24px 28px', width: '100%', maxWidth: 480,
        margin: '0 16px',
      }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: T.text }}>
          Create Board
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              placeholder="Board name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>
              Description <span style={{ color: T.textMuted, fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              placeholder="What is this board for? (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={2000}
              style={textareaStyle}
            />
          </div>

          {/* Emoji picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Emoji</label>
            <div
              role="group"
              aria-label="Emoji picker"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 4,
              }}
            >
              {EMOJI_SYMBOLS.map(sym => (
                <button
                  key={sym}
                  type="button"
                  role="button"
                  aria-label={sym}
                  aria-pressed={emoji === sym}
                  onClick={() => setEmoji(sym)}
                  style={{
                    height: 36, fontSize: 18,
                    background: emoji === sym ? T.accentSoft : 'transparent',
                    border: emoji === sym ? `2px solid ${T.accent}` : `1px solid ${T.cardBorder}`,
                    borderRadius: 6,
                    cursor: 'pointer', color: T.text,
                    outline: emoji === sym ? `2px solid ${T.accent}` : 'none',
                    outlineOffset: 1,
                  }}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Colour swatches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Colour</label>
            <div
              role="group"
              aria-label="Colour picker"
              style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
            >
              {SWATCH_COLORS.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={c ?? 'No colour'}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: c ?? T.card,
                    border: color === c
                      ? `3px solid ${T.accent}`
                      : `2px solid ${T.cardBorder}`,
                    cursor: 'pointer',
                    position: 'relative',
                    outline: color === c ? `2px solid ${T.accent}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Preview</label>
            <div
              data-testid="board-preview"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: T.card,
                border: `1px solid ${color ?? T.cardBorder}`,
                borderLeft: color ? `4px solid ${color}` : `1px solid ${T.cardBorder}`,
                borderRadius: 8,
                minHeight: 44,
              }}
            >
              <span style={{ fontSize: 20 }}>{emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                {name || <span style={{ color: T.textFaint }}>Board name</span>}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                height: 36, padding: '0 16px',
                background: 'transparent', color: T.text,
                border: `1px solid ${T.cardBorder}`, borderRadius: 7,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              style={{
                height: 36, padding: '0 16px',
                background: loading ? T.accentSoft : T.accent,
                color: loading ? T.accent : T.accentText,
                border: 'none', borderRadius: 7,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'background .15s',
              }}
            >
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
