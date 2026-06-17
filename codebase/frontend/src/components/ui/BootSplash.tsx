'use client'
import { useEffect, useState } from 'react'

export default function BootSplash() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 800)
    const hideTimer = setTimeout(() => setVisible(false), 1200)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0d18',
        opacity: fading ? 0 : 1,
        transition: 'opacity 400ms ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <svg
        width="56" height="56" viewBox="0 0 32 32"
        style={{ animation: 'bootsplash-pulse 1s ease-in-out infinite' }}
      >
        <style>{`
          @keyframes bootsplash-pulse {
            0%,100% { opacity: 1; transform: scale(1); }
            50%      { opacity: .7; transform: scale(.92); }
          }
        `}</style>
        <path fill="#6366f1" d="M6 4h5v10l8-10h6L15 16l10 12h-6L11 18v10H6V4z"/>
      </svg>
    </div>
  )
}
