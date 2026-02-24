import { notifyError } from './notify'

export function handleSupabaseError(context: string, error: any) {
  console.error(`Error en ${context}:`, error)
  const message = error?.message || 'Ocurrió un error inesperado.'
  notifyError(message)
}

