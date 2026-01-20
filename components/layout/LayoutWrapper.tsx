'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from './Navigation'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return <main>{children}</main>
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </>
  )
}
