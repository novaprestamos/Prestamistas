export type ToastTone = 'success' | 'error'

type ToastDetail = {
  message: string
  tone: ToastTone
}

const dispatchToast = (detail: ToastDetail) => {
  if (typeof window === 'undefined') return
  const event = new CustomEvent<ToastDetail>('app:toast', { detail })
  window.dispatchEvent(event)
}

export const notifySuccess = (message: string) => {
  dispatchToast({ message, tone: 'success' })
}

export const notifyError = (message: string) => {
  dispatchToast({ message, tone: 'error' })
}
