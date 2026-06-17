import './globals.css'
import type { Metadata } from 'next'
import ThemeProvider from '@/components/ui/ThemeProvider'
import BootSplash from '@/components/ui/BootSplash'

export const metadata: Metadata = {
  title: 'Kanban',
  description: 'Collaborative Kanban board',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath fill='%236366f1' d='M6 4h5v10l8-10h6L15 16l10 12h-6L11 18v10H6V4z'/%3E%3C/svg%3E"
        />
      </head>
      <body>
        <BootSplash />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
