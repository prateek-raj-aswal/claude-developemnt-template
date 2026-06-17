'use client'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { T } from '@/lib/theme'
import type { TimelineCardResponse } from '@/types/api'
import Icon from '@/components/ui/Icon'
import CardModal from './CardModal'

const DAY_W = 28          // px per day column
const LEFT_PANEL = 200    // px left label panel
const DATE_FROM_OFFSET = 30  // days before today
const DATE_TO_OFFSET = 90    // days after today
const HEADER_H1 = 28
const HEADER_H2 = 24

interface Props {
  boardId: string
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

function dayDiff(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

function isWeekend(d: Date): boolean {
  const day = d.getDay()
  return day === 0 || day === 6
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default function TimelineView({ boardId }: Props) {
  const [cards, setCards] = useState<TimelineCardResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [boardName, setBoardName] = useState('')
  const [selectedCard, setSelectedCard] = useState<TimelineCardResponse | null>(null)
  const [dragging, setDragging] = useState<{
    cardId: string
    edge: 'start' | 'end'
    startX: number
    originalDate: string
  } | null>(null)
  const [localDates, setLocalDates] = useState<
    Record<string, { startDate: string | null; dueDate: string | null }>
  >({})

  const draggingRef = useRef(dragging)
  draggingRef.current = dragging
  const localDatesRef = useRef(localDates)
  localDatesRef.current = localDates
  const cardsRef = useRef(cards)
  cardsRef.current = cards

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateFrom = addDays(today, -DATE_FROM_OFFSET)
  const dateTo = addDays(today, DATE_TO_OFFSET)
  const totalDays = dayDiff(dateFrom, dateTo) + 1
  const todayOffset = dayDiff(dateFrom, today)

  // Build list of all days in the view window
  const days = Array.from({ length: totalDays }, (_, i) => addDays(dateFrom, i))

  useEffect(() => {
    const from = isoDate(dateFrom)
    const to = isoDate(dateTo)
    Promise.all([
      api.get<{ items: TimelineCardResponse[] }>(
        `/api/v1/boards/${boardId}/timeline?from=${from}&to=${to}`
      ),
      api.get<{ name: string }>(`/api/v1/boards/${boardId}`).catch(() => ({ name: '' })),
    ])
      .then(([data, board]) => {
        setCards((data as any)?.items ?? [])
        setBoardName((board as any)?.name ?? '')
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load timeline')
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId])

  // Mouse event handlers for drag resize (attached to document)
  useEffect(() => {
    if (!dragging) return

    const onMove = (e: MouseEvent) => {
      const d = draggingRef.current
      if (!d) return
      const card = cardsRef.current.find(c => c.id === d.cardId)
      if (!card) return
      const deltaDays = Math.round((e.clientX - d.startX) / DAY_W)
      const orig = new Date(d.originalDate)
      const newDate = isoDate(addDays(orig, deltaDays))
      setLocalDates(prev => ({
        ...prev,
        [d.cardId]: d.edge === 'end'
          ? { startDate: card.startDate, dueDate: newDate }
          : { startDate: newDate, dueDate: card.dueDate },
      }))
    }

    const onUp = async () => {
      const d = draggingRef.current
      if (!d) return
      setDragging(null)
      const card = cardsRef.current.find(c => c.id === d.cardId)
      if (!card) return
      const dates = localDatesRef.current[d.cardId] ?? {
        startDate: card.startDate,
        dueDate: card.dueDate,
      }
      try {
        await api.patch(`/api/v1/cards/${d.cardId}/dates`, {
          startDate: dates.startDate,
          dueDate: dates.dueDate,
        })
        // Commit optimistic update to cards
        setCards(prev =>
          prev.map(c =>
            c.id === d.cardId
              ? { ...c, startDate: dates.startDate, dueDate: dates.dueDate }
              : c
          )
        )
      } catch {
        // Revert on any error (including 422)
        setLocalDates(prev => {
          const next = { ...prev }
          delete next[d.cardId]
          return next
        })
      } finally {
        setLocalDates(prev => {
          const next = { ...prev }
          delete next[d.cardId]
          return next
        })
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [dragging])

  const handleDragStart = (
    e: React.MouseEvent,
    cardId: string,
    edge: 'start' | 'end'
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const card = cards.find(c => c.id === cardId)!
    const originalDate = edge === 'end' ? (card.dueDate ?? '') : (card.startDate ?? '')
    setDragging({ cardId, edge, startX: e.clientX, originalDate })
  }

  function getEffectiveDates(card: TimelineCardResponse) {
    return localDates[card.id] ?? { startDate: card.startDate, dueDate: card.dueDate }
  }

  function getBarStyle(card: TimelineCardResponse): React.CSSProperties {
    const { startDate, dueDate } = getEffectiveDates(card)
    const sd = startDate ? new Date(startDate) : dueDate ? new Date(dueDate) : null
    const dd = dueDate ? new Date(dueDate) : sd
    if (!sd || !dd) return { display: 'none' }
    const left = LEFT_PANEL + dayDiff(dateFrom, sd) * DAY_W
    const width = Math.max((dayDiff(sd, dd) + 1) * DAY_W, DAY_W)
    return {
      position: 'absolute',
      left,
      width,
      height: 28,
      top: 6,
      borderRadius: 6,
      background: T.accent,
      opacity: 0.85,
      cursor: 'pointer',
    }
  }

  const hasNoDate = (c: TimelineCardResponse) => !c.startDate && !c.dueDate

  // Build swimlane groups preserving column order (first-seen order)
  const seenCols: string[] = []
  const colGroups: Record<string, TimelineCardResponse[]> = {}
  for (const card of cards) {
    if (hasNoDate(card)) continue
    if (!colGroups[card.columnName]) {
      seenCols.push(card.columnName)
      colGroups[card.columnName] = []
    }
    colGroups[card.columnName].push(card)
  }
  const noDatesCards = cards.filter(hasNoDate)

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: T.canvas, color: T.text }}>
        <div data-testid="timeline-loading" style={{ fontSize: 13, color: T.textFaint }}>
          Loading…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: T.canvas, color: T.text }}>
        <div data-testid="timeline-error" style={{ fontSize: 13, color: '#ef4444' }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: T.canvas, color: T.text,
    }}>
        {/* Top bar */}
        <div style={{
          height: 44, flexShrink: 0, display: 'flex', alignItems: 'center',
          padding: '0 14px', gap: 14,
          borderBottom: `1px solid ${T.topbarBorder}`, background: T.topbar,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: T.textMuted }}>
            <a href="/boards" style={{ color: T.textMuted, textDecoration: 'none' }}>My Boards</a>
            <Icon name="chevron" size={10} sw={2} />
            <a href={`/boards/${boardId}`} style={{ color: T.text, fontWeight: 600, textDecoration: 'none' }}>
              {boardName || '…'}
            </a>
            <Icon name="chevron" size={10} sw={2} />
            <span style={{ color: T.textMuted }}>Timeline</span>
          </div>
        </div>

        {/* View tab strip */}
        <div style={{
          padding: '10px 18px 8px', flexShrink: 0,
          background: T.canvas, borderBottom: `1px solid ${T.topbarBorder}`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', flex: 1 }}>
            {boardName || '…'}
          </h1>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            padding: 2, background: T.chipBg, borderRadius: 7,
          }}>
            {([
              { id: 'board', icon: 'grid', label: 'Board', href: `/boards/${boardId}` },
              { id: 'timeline', icon: 'timeline', label: 'Timeline', href: `/boards/${boardId}/timeline` },
              { id: 'cal', icon: 'cal', label: 'Calendar', href: `/boards/${boardId}/calendar` },
            ] as const).map(tab => {
              const active = tab.id === 'timeline'
              return (
                <a key={tab.id} href={tab.href} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 9px', borderRadius: 5,
                  fontSize: 12, fontWeight: 500, textDecoration: 'none',
                  color: active ? T.text : T.textMuted,
                  background: active ? T.card : 'transparent',
                  border: active ? `1px solid ${T.cardBorder}` : '1px solid transparent',
                  boxShadow: active ? T.cardShadow : 'none',
                }}>
                  <Icon name={tab.icon as any} size={12} sw={1.7} />
                  {tab.label}
                </a>
              )
            })}
          </div>
        </div>

        {/* Timeline grid — horizontally scrollable */}
        <div
          data-testid="timeline-scroll-container"
          style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', position: 'relative' }}
        >
          <div style={{ minWidth: LEFT_PANEL + totalDays * DAY_W, position: 'relative' }}>

            {/* ── Header row 1: months ── */}
            <div style={{
              display: 'flex', height: HEADER_H1,
              position: 'sticky', top: 0, zIndex: 9,
              background: T.sidebar, borderBottom: `1px solid ${T.cardBorder}`,
            }}>
              {/* Left panel spacer */}
              <div
                data-testid="left-panel"
                style={{ width: LEFT_PANEL, flexShrink: 0 }}
              />
              {/* Month labels derived from day list */}
              {(() => {
                const segments: { label: string; count: number }[] = []
                let cur: { label: string; count: number } | null = null
                for (const d of days) {
                  const label = d.toLocaleString('default', { month: 'short', year: 'numeric' })
                  if (!cur || cur.label !== label) {
                    cur = { label, count: 1 }
                    segments.push(cur)
                  } else {
                    cur.count++
                  }
                }
                return segments.map((seg, i) => (
                  <div key={i} style={{
                    width: seg.count * DAY_W, flexShrink: 0,
                    fontSize: 11, fontWeight: 600, color: T.textMuted,
                    display: 'flex', alignItems: 'center', paddingLeft: 6,
                    borderRight: `1px solid ${T.cardBorder}`,
                  }}>
                    {seg.label}
                  </div>
                ))
              })()}
            </div>

            {/* ── Header row 2: day numbers ── */}
            <div style={{
              display: 'flex', height: HEADER_H2,
              position: 'sticky', top: HEADER_H1, zIndex: 9,
              background: T.sidebar, borderBottom: `2px solid ${T.cardBorder}`,
            }}>
              <div style={{ width: LEFT_PANEL, flexShrink: 0 }} />
              {days.map((d, i) => {
                const dom = d.getDate()
                const isToday = i === todayOffset
                const show = dom === 1 || dom % 7 === 0 || isToday
                return (
                  <div
                    key={i}
                    data-testid={`day-col-${i}`}
                    data-weekend={isWeekend(d) ? 'true' : 'false'}
                    style={{
                      width: DAY_W,
                      flexShrink: 0,
                      fontSize: 10,
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? T.accent : dom === 1 ? T.text : T.textFaint,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isWeekend(d)
                        ? 'rgba(0,0,0,0.08)'
                        : isToday
                          ? T.accentSoft
                          : 'transparent',
                      borderRight: dom === 1 ? `1px solid ${T.cardBorder}` : 'none',
                    }}
                  >
                    {show ? dom : ''}
                  </div>
                )
              })}
            </div>

            {/* ── Swimlane body ── */}
            <div style={{ position: 'relative' }}>

              {/* Today line */}
              <div
                data-testid="today-line"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: LEFT_PANEL + todayOffset * DAY_W,
                  width: 2,
                  background: T.accent,
                  zIndex: 5,
                  pointerEvents: 'none',
                }}
              />

              {/* Column swimlanes */}
              {seenCols.map(colName => (
                <div key={colName}>
                  {/* Swimlane header */}
                  <div
                    data-testid={`swimlane-${colName}`}
                    style={{
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 8,
                      fontWeight: 600,
                      fontSize: 12,
                      background: T.sidebar,
                      borderBottom: `1px solid ${T.cardBorder}`,
                      position: 'sticky',
                      left: 0,
                    }}
                  >
                    {colName}
                  </div>

                  {/* Card rows */}
                  {colGroups[colName].map(card => (
                    <div
                      key={card.id}
                      style={{
                        position: 'relative',
                        height: 40,
                        borderBottom: `1px solid ${T.cardBorder}`,
                        background: T.canvas,
                      }}
                    >
                      {/* Weekend column shading behind bar */}
                      {days.map((d, i) =>
                        isWeekend(d) ? (
                          <div
                            key={i}
                            style={{
                              position: 'absolute',
                              top: 0,
                              bottom: 0,
                              left: LEFT_PANEL + i * DAY_W,
                              width: DAY_W,
                              background: 'rgba(0,0,0,0.04)',
                              pointerEvents: 'none',
                            }}
                          />
                        ) : null
                      )}

                      {/* Left label */}
                      <div
                        style={{
                          width: LEFT_PANEL,
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: 8,
                          fontSize: 12,
                          overflow: 'hidden',
                          zIndex: 2,
                          background: T.sidebar,
                          borderRight: `1px solid ${T.cardBorder}`,
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {card.title}
                        </span>
                      </div>

                      {/* Card bar */}
                      <div
                        data-testid={`card-bar-${card.id}`}
                        style={getBarStyle(card)}
                        onClick={() => setSelectedCard(card)}
                        onMouseEnter={e => {
                          ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${T.accent}`
                        }}
                        onMouseLeave={e => {
                          ;(e.currentTarget as HTMLElement).style.boxShadow = ''
                        }}
                      >
                        {/* Right drag handle */}
                        <div
                          data-testid={`bar-right-handle-${card.id}`}
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            width: 8,
                            height: '100%',
                            cursor: 'ew-resize',
                          }}
                          onMouseDown={e => handleDragStart(e, card.id, 'end')}
                        />
                        {/* Left drag handle */}
                        <div
                          data-testid={`bar-left-handle-${card.id}`}
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: 8,
                            height: '100%',
                            cursor: 'ew-resize',
                          }}
                          onMouseDown={e => handleDragStart(e, card.id, 'start')}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* No dates swimlane */}
              {noDatesCards.length > 0 && (
                <div>
                  <div
                    data-testid="swimlane-No dates"
                    style={{
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 8,
                      fontWeight: 600,
                      fontSize: 12,
                      background: T.sidebar,
                      borderBottom: `1px solid ${T.cardBorder}`,
                      color: T.textMuted,
                    }}
                  >
                    No dates
                  </div>
                  {noDatesCards.map(card => (
                    <div
                      key={card.id}
                      style={{
                        position: 'relative',
                        height: 40,
                        borderBottom: `1px solid ${T.cardBorder}`,
                        background: T.canvas,
                      }}
                    >
                      <div
                        style={{
                          width: LEFT_PANEL,
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: 8,
                          fontSize: 12,
                          overflow: 'hidden',
                          zIndex: 2,
                          background: T.sidebar,
                          borderRight: `1px solid ${T.cardBorder}`,
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {card.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cards.length === 0 && (
                <div style={{
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  color: T.textFaint,
                }}>
                  No cards have dates set. Add start or due dates to cards to see them here.
                </div>
              )}
            </div>
          </div>
        </div>

      {/* CardModal */}
      {selectedCard && (
        <CardModal
          card={{
            id: selectedCard.id,
            columnId: selectedCard.columnId,
            title: selectedCard.title,
            description: null,
            position: 0,
            startDate: selectedCard.startDate,
            dueDate: selectedCard.dueDate,
            priority: selectedCard.priority as any,
            labels: [],
            assignees: selectedCard.assignees,
          }}
          columnName={selectedCard.columnName}
          boardId={boardId}
          onClose={() => setSelectedCard(null)}
          onUpdate={updated => {
            setCards(prev => prev.map(c =>
              c.id === updated.id
                ? { ...c, startDate: updated.startDate, dueDate: updated.dueDate, title: updated.title }
                : c
            ))
            setSelectedCard(null)
          }}
          onDelete={cardId => {
            setCards(prev => prev.filter(c => c.id !== cardId))
            setSelectedCard(null)
          }}
        />
      )}
    </div>
  )
}
