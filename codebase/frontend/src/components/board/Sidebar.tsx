'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { T, THEMES, type IconKey } from '@/lib/theme'
import type { BoardResponse, AuthResponse, SmartCardResponse, WorkspaceResponse } from '@/types/api'
import Icon from '@/components/ui/Icon'
import SettingsModal from '@/components/ui/SettingsModal'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import WorkspaceManageModal from './WorkspaceManageModal'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useAuthStore } from '@/store/authStore'
import { getRefreshToken } from '@/lib/auth'
import { useIsMobile } from '@/lib/useIsMobile'
import { useSidebarStore } from '@/store/sidebarStore'
import { useThemeStore } from '@/store/themeStore'

interface Props {
  currentBoardId?: string
}

export default function Sidebar({ currentBoardId }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()
  const logout = useAuthStore(s => s.logout)
  const { collapsed, setCollapsed } = useSidebarStore()
  const themeName = useThemeStore(s => s.theme)
  const glass = THEMES[themeName].glass
  const { workspaces, activeWorkspaceId, setWorkspaces } = useWorkspaceStore()

  function handleLogout() {
    const rt = getRefreshToken()
    logout()
    router.push('/login')
    if (rt) api.post('/api/v1/auth/logout', { refreshToken: rt }).catch(() => {})
  }

  const [boards, setBoards] = useState<BoardResponse[]>([])
  const [starredBoards, setStarredBoards] = useState<BoardResponse[]>([])
  const [inboxCount, setInboxCount] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profile, setProfile] = useState<AuthResponse | null>(null)
  const [usersWorkspace, setUsersWorkspace] = useState<WorkspaceResponse | null>(null)
  const [newWsOpen, setNewWsOpen] = useState(false)
  const [newWsName, setNewWsName] = useState('')
  const [newWsLoading, setNewWsLoading] = useState(false)

  async function loadBoards() {
    const data = await api.get<BoardResponse[]>('/api/v1/boards').catch(() => [] as BoardResponse[])
    setBoards(data)
  }

  useEffect(() => {
    Promise.all([
      api.get<BoardResponse[]>('/api/v1/boards').catch(() => [] as BoardResponse[]),
      api.get<BoardResponse[]>('/api/v1/me/starred-boards').catch(() => [] as BoardResponse[]),
      api.get<WorkspaceResponse[]>('/api/v1/workspaces').catch(() => [] as WorkspaceResponse[]),
      api.get<SmartCardResponse[]>('/api/v1/me/inbox').catch(() => [] as SmartCardResponse[]),
      api.get<SmartCardResponse[]>('/api/v1/me/today').catch(() => [] as SmartCardResponse[]),
      api.get<SmartCardResponse[]>('/api/v1/me/upcoming').catch(() => [] as SmartCardResponse[]),
      api.get<AuthResponse>('/api/v1/users/me').catch(() => null as AuthResponse | null),
    ]).then(([b, starred, ws, inbox, today, upcoming, prof]) => {
      setBoards(b)
      setStarredBoards(starred)
      setWorkspaces(ws)
      setInboxCount(inbox.length)
      setTodayCount(today.length)
      setUpcomingCount(upcoming.length)
      if (prof) setProfile(prof)
    })
  }, [])

  async function handleCreateWorkspace() {
    if (!newWsName.trim()) return
    setNewWsLoading(true)
    try {
      const created = await api.post<WorkspaceResponse>('/api/v1/workspaces', { name: newWsName.trim() })
      setWorkspaces([...workspaces, created])
      setNewWsName('')
      setNewWsOpen(false)
    } catch { /* silently ignore */ }
    finally { setNewWsLoading(false) }
  }

  function openUsersModal() {
    const ws = workspaces.find(w => w.id === activeWorkspaceId) ?? workspaces[0] ?? null
    if (ws) setUsersWorkspace(ws)
  }

  const visibleBoards = activeWorkspaceId
    ? boards.filter(b => b.workspaceId === activeWorkspaceId)
    : boards

  const workspaceGroups: { id: string | null; name: string; boards: BoardResponse[] }[] = []
  const wsMap = new Map(workspaces.map(w => [w.id, w.name]))
  const byWorkspace = new Map<string | null, BoardResponse[]>()

  for (const b of visibleBoards) {
    const key = b.workspaceId ?? null
    if (!byWorkspace.has(key)) byWorkspace.set(key, [])
    byWorkspace.get(key)!.push(b)
  }

  if (byWorkspace.has(null) && byWorkspace.get(null)!.length > 0) {
    workspaceGroups.push({ id: null, name: 'Personal', boards: byWorkspace.get(null)! })
  }
  for (const ws of workspaces) {
    const wBoards = byWorkspace.get(ws.id) ?? []
    if (wBoards.length > 0) {
      workspaceGroups.push({ id: ws.id, name: ws.name, boards: wBoards })
    }
  }

  const NavItem = ({ label, icon, count, active, href, onClick, ariaLabel }: {
    label: string; icon?: IconKey; count?: number; active?: boolean; href?: string; onClick?: () => void; ariaLabel?: string
  }) => (
    <a
      href={href ?? '#'}
      title={collapsed ? label : ariaLabel}
      aria-label={ariaLabel}
      onClick={onClick ? (e) => { e.preventDefault(); onClick() } : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : 8,
        padding: collapsed ? '8px 0' : '6px 10px', fontSize: 13,
        fontWeight: active ? 600 : 500,
        color: active ? T.selectedText : T.text,
        background: active ? T.selectedBg : 'transparent',
        borderRadius: 6, cursor: 'pointer', textDecoration: 'none',
      }}
    >
      {icon && (
        <Icon name={icon} size={14} sw={active ? 2 : 1.6}
          style={{ color: active ? T.selectedText : T.textMuted }} />
      )}
      {!collapsed && (
        <>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </span>
          {count != null && count > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: active ? T.selectedText : T.accentSoft,
              color: active ? T.selectedBg : T.accent,
              borderRadius: 10, padding: '1px 6px',
              fontVariantNumeric: 'tabular-nums',
            }}>{count}</span>
          )}
        </>
      )}
    </a>
  )

  const SectionHead = ({ children, showAdd }: { children: React.ReactNode; showAdd?: boolean }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 12px 4px',
      fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em',
      color: T.textFaint, textTransform: 'uppercase',
    }}>
      <span>{children}</span>
      {showAdd && (
        <a href="/boards" style={{ color: T.textFaint, cursor: 'pointer' }}>
          <Icon name="plus" size={12} sw={2} />
        </a>
      )}
    </div>
  )

  return (
    <>
    <aside style={{
      width: collapsed ? 48 : 232, flexShrink: 0,
      background: T.sidebar, borderRight: `1px solid ${T.sidebarBorder}`,
      display: isMobile ? 'none' : 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      paddingBottom: 0,
      transition: 'width 0.18s ease',
      backdropFilter: glass ? 'blur(20px) saturate(140%)' : undefined,
    }}>
      {/* Workspace header */}
      <div style={{
        padding: '12px 12px 10px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${T.sidebarBorder}`, flexShrink: 0,
      }}>
        {!collapsed && (
          <>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: T.accent, color: T.accentText,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, letterSpacing: '-.02em', flexShrink: 0,
            }}>K</div>
            <WorkspaceSwitcher onWorkspaceChange={loadBoards} />
          </>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
            color: T.textFaint, display: 'inline-flex', alignItems: 'center',
            borderRadius: 4, flexShrink: 0, marginLeft: collapsed ? 0 : 'auto',
          }}
        >
          <Icon name={collapsed ? 'chevron' : 'chevLeft'} size={14} />
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
      <div style={{ padding: '10px 12px 4px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px',
          background: T.hover, borderRadius: 6, fontSize: 12, color: T.textFaint,
        }}>
          <Icon name="search" size={12} sw={1.7} />
          <span style={{ flex: 1 }}>Search</span>
          <span style={{
            fontSize: 10, fontWeight: 600, border: `1px solid ${T.cardBorder}`,
            padding: '0 4px', borderRadius: 3, background: T.card,
          }}>⌘K</span>
        </div>
      </div>
      )}

      {/* Nav */}
      <div style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>

        {/* Smart views */}
        <NavItem icon="inbox" label="Inbox" count={inboxCount}
          active={pathname === '/inbox'} href="/inbox" />
        <NavItem icon="clock" label="Today" count={todayCount}
          active={pathname === '/today'} href="/today" />
        <NavItem icon="cal" label="Upcoming" count={upcomingCount}
          active={pathname === '/upcoming'} href="/upcoming" />

        {/* Starred boards */}
        {starredBoards.length > 0 && (
          <>
            {!collapsed && <SectionHead>Starred</SectionHead>}
            {starredBoards.map(b => (
              <NavItem
                key={b.id}
                icon="star"
                label={b.name}
                active={b.id === currentBoardId}
                href={`/boards/${b.id}`}
              />
            ))}
          </>
        )}

        {/* Boards grouped by workspace */}
        {workspaceGroups.length > 0 && (
          <>
            {!collapsed && <SectionHead showAdd>Boards</SectionHead>}
            {workspaceGroups.map(group => (
              <div key={group.id ?? 'personal'}>
                {!collapsed && workspaceGroups.length > 1 && (
                  <div style={{
                    padding: '6px 10px 2px',
                    fontSize: 10.5, fontWeight: 600,
                    color: T.textFaint, letterSpacing: '.04em',
                  }}>{group.name}</div>
                )}
                {group.boards.map(b => (
                  <NavItem
                    key={b.id}
                    label={b.name}
                    active={b.id === currentBoardId}
                    href={`/boards/${b.id}`}
                    count={b.taskCount ?? 0}
                  />
                ))}
              </div>
            ))}
          </>
        )}

        {visibleBoards.length === 0 && (
          <div style={{ padding: '20px 10px', fontSize: 12, color: T.textFaint, textAlign: 'center' }}>
            No boards yet.{' '}
            <a href="/boards" style={{ color: T.accent }}>Create one</a>
          </div>
        )}

        {/* Workspace partition */}
        <div style={{ marginTop: 8 }}>
          {!collapsed && <SectionHead>Workspace</SectionHead>}
          <NavItem icon="user" label="Users" onClick={openUsersModal} active={false} />
          <NavItem icon="alert" label="Issues" href="/issues" active={pathname === '/issues'} />
          <NavItem icon="cog" label="Settings" onClick={() => setSettingsOpen(true)} active={false} ariaLabel="Settings" />
          <NavItem icon="plus" label="New workspace" onClick={() => setNewWsOpen(true)} active={false} />
        </div>
      </div>

      {/* Bottom user row */}
      <div style={{
        padding: collapsed ? '10px 0' : '10px 12px',
        borderTop: `1px solid ${T.sidebarBorder}`,
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexDirection: collapsed ? 'column' : 'row',
        gap: 9, flexShrink: 0,
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: T.accentSoft, color: T.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="user" size={12} sw={1.5} />
        </div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.displayName || profile?.email || 'Account'}
            </div>
            {profile?.email && (
              <div style={{ fontSize: 10.5, color: T.textFaint, lineHeight: 1.1, marginTop: 2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.email}
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.textMuted, display: 'inline-flex', alignItems: 'center',
            padding: 2, borderRadius: 4,
          }}
        >
          <Icon name="logout" size={14} />
        </button>
      </div>
    </aside>

    <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

    {usersWorkspace && (
      <WorkspaceManageModal
        workspace={usersWorkspace}
        onClose={() => setUsersWorkspace(null)}
        onUpdated={() => { setUsersWorkspace(null); loadBoards() }}
        onDeleted={() => { setUsersWorkspace(null); loadBoards() }}
      />
    )}

    {newWsOpen && (
      <div
        role="presentation"
        onClick={(e) => { if (e.target === e.currentTarget) setNewWsOpen(false) }}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="New workspace"
          style={{
            width: '100%', maxWidth: 360,
            background: T.card, border: `1px solid ${T.cardBorder}`,
            borderRadius: 12, padding: 24,
            boxShadow: '0 16px 48px rgba(0,0,0,.35)',
          }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: T.text }}>
            New workspace
          </h2>
          <input
            autoFocus
            value={newWsName}
            onChange={e => setNewWsName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreateWorkspace()
              if (e.key === 'Escape') setNewWsOpen(false)
            }}
            placeholder="Workspace name"
            style={{
              width: '100%', padding: '8px 12px',
              borderRadius: 6, border: `1px solid ${T.cardBorder}`,
              background: T.canvas, color: T.text,
              fontSize: 13, boxSizing: 'border-box', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setNewWsOpen(false)}
              style={{
                padding: '7px 16px', borderRadius: 6, fontSize: 13,
                border: `1px solid ${T.cardBorder}`, background: T.card,
                color: T.text, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateWorkspace}
              disabled={newWsLoading || !newWsName.trim()}
              style={{
                padding: '7px 16px', borderRadius: 6, fontSize: 13,
                border: 'none', background: T.accent,
                color: T.accentText, cursor: 'pointer',
                opacity: newWsLoading || !newWsName.trim() ? 0.5 : 1,
              }}
            >
              {newWsLoading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
