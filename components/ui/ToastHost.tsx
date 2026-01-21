'use client'

import { useEffect, useState } from 'react'
import type { ToastTone } from '@/lib/notify'

type ToastItem = {
  id: string
  message: string
  tone: ToastTone
}

const DEFAULT_TIMEOUT = 3500

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; tone: ToastTone }>).detail
      if (!detail?.message) return

      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      setToasts((prev) => [...prev, { id, message: detail.message, tone: detail.tone }])

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, DEFAULT_TIMEOUT)
    }

    window.addEventListener('app:toast', handler)
    return () => window.removeEventListener('app:toast', handler)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.tone === 'success' ? 'toast-success' : 'toast-error'}`}>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
