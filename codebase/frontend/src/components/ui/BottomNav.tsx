'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { T } from '@/lib/theme'
import Icon from './Icon'
import { useIsMobile } from '@/lib/useIsMobile'
import SettingsModal from './SettingsModal'

const TABS = [
  { id: 'board',    icon: 'grid'     as const, label: 'Board',    href: '/boards' },
  { id: 'today',    icon: 'clock'    as const, label: 'Today',    href: '/today' },
  { id: 'timeline', icon: 'timeline' as const, label: 'Timeline', href: '/boards' },
  { id: 'inbox',    icon: 'msg'      as const, label: 'Inbox',    href: '/inbox' },
  { id: 'issues',   icon: 'alert'    as const, label: 'Issues',   href: '/issues' },
]

export default function BottomNav() {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const [showSettings, setShowSettings] = useState(false)

  if (!isMobile) return null

  function isActive(tab: typeof TABS[number]): boolean {
    if (tab.id === 'board') return pathname.startsWith('/boards') && !pathname.includes('/timeline') && !pathname.includes('/calendar')
    if (tab.id === 'timeline') return pathname.includes('/timeline')
    if (tab.id === 'issues') return pathname === '/issues'
    return pathname.startsWith(tab.href) && tab.href !== '/boards'
  }

  return (
    <>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 56, background: T.topbar,
        borderTop: `1px solid ${T.topbarBorder}`,
        display: 'flex', alignItems: 'stretch',
        zIndex: 100,
        fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}>
        {TABS.map(tab => {
          const active = isActive(tab)
          return (
            <a
              key={tab.id}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                color: active ? T.accent : T.textMuted,
                textDecoration: 'none', fontSize: 10, fontWeight: 500,
                background: 'transparent',
              }}
            >
              <Icon name={tab.icon} size={20} sw={active ? 2.2 : 1.7} />
              {tab.label}
            </a>
          )
        })}
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 3,
            color: showSettings ? T.accent : T.textMuted,
            fontSize: 10, fontWeight: 500,
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}
        >
          <Icon name="cog" size={20} sw={showSettings ? 2.2 : 1.7} />
          Settings
        </button>
      </nav>

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        showSignOut
      />
    </>
  )
}
