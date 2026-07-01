'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import Sidebar from '@/components/board/Sidebar'
import BottomNav from '@/components/ui/BottomNav'
import AmbientBg from '@/components/ui/AmbientBg'
import { T } from '@/lib/theme'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
      return
    }
    setReady(true)
  }, [router])

  useEffect(() => {
    function handleUnauthorized() {
      router.replace('/login')
    }
    window.addEventListener('kanban:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('kanban:unauthorized', handleUnauthorized)
  }, [router])

  if (!ready) return null

  const boardMatch = pathname.match(/^\/boards\/([^/]+)/)
  const currentBoardId = boardMatch?.[1]

  return (
    <div style={{
      position: 'relative',
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: T.canvas,
      fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      color: T.text,
    }}>
      <AmbientBg />
      <Sidebar currentBoardId={currentBoardId} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
