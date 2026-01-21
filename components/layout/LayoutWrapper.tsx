'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from './Navigation'
import { ToastHost } from '@/components/ui/ToastHost'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return (
      <>
        <main>{children}</main>
        <ToastHost />
      </>
    )
  }

  return (
    <div className="app-shell">
      <Navigation />
      <ToastHost />
      <main className="app-main">
        <div className="app-container">{children}</div>
      </main>
    </div>
  )
}
