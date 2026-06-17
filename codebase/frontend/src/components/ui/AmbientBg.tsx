'use client'
import { useThemeStore } from '@/store/themeStore'
import { THEMES } from '@/lib/theme'

export default function AmbientBg() {
  const themeName = useThemeStore(s => s.theme)
  const theme = THEMES[themeName]

  if (!theme.gradient) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Layer 1: canvas gradient */}
      {theme.canvasGradient && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: theme.canvasGradient,
          }}
        />
      )}

      {/* Layer 2: ambient blobs */}
      {(theme.ambientBlobs ?? []).map((blob, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: blob.color,
            filter: 'blur(80px)',
            top: blob.style.top,
            bottom: blob.style.bottom,
            left: blob.style.left,
            right: blob.style.right,
            width: blob.style.width,
            height: blob.style.height,
          }}
        />
      ))}

      {/* Layer 3: dot-grid overlay */}
      {theme.gridColor && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${theme.gridColor} 1px, transparent 1px)`,
            backgroundSize: '3px 3px',
          }}
        />
      )}
    </div>
  )
}
