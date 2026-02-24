import { supabase, Pago, Prestamo, Cliente, Usuario } from './supabase'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export async function fetchPrestamosParaPagos(usuario: Usuario): Promise<Prestamo[]> {
  let query = supabase
    .from('prestamos')
    .select('*')
    .in('estado', ['activo', 'vencido', 'moroso'])

  if (usuario.rol !== 'admin') {
    query = query.eq('created_by', usuario.id)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchPagosForMes(
  usuario: Usuario,
  filterMes: string
): Promise<(Pago & { prestamo?: Prestamo & { cliente?: Cliente } })[]> {
  const inicioMes = startOfMonth(new Date(filterMes + '-01'))
  const finMes = endOfMonth(new Date(filterMes + '-01'))

  let query = supabase
    .from('pagos')
    .select(`
      *,
      prestamo:prestamos(
        *,
        cliente:clientes(*)
      )
    `)
    .gte('fecha_pago', format(inicioMes, 'yyyy-MM-dd'))
    .lte('fecha_pago', format(finMes, 'yyyy-MM-dd'))

  if (usuario.rol !== 'admin') {
    const { data: userPrestamos } = await supabase
      .from('prestamos')
      .select('id')
      .eq('created_by', usuario.id)

    const prestamoIds = userPrestamos?.map((p) => p.id) || []
    if (prestamoIds.length === 0) {
      return []
    }

    query = query.in('prestamo_id', prestamoIds)
  }

  const { data, error } = await query.order('fecha_pago', { ascending: false })
  if (error) throw error
  return (data || []) as any
}

export async function deletePagoById(id: string): Promise<void> {
  const { error } = await supabase
    .from('pagos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

