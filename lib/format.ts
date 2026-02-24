export function formatCurrency(value: number): string {
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return 'No registrada'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'No registrada'
  return date.toLocaleDateString('es-ES')
}

