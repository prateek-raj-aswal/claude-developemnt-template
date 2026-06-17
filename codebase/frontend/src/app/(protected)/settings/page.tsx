'use client'
import { useRouter } from 'next/navigation'
import { SettingsContent } from '@/components/ui/SettingsModal'

export default function SettingsPage() {
  const router = useRouter()
  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
      <SettingsContent onClose={() => router.back()} />
    </div>
  )
}
