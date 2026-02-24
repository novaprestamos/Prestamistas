import { supabase, Cliente, Prestamo, Usuario } from './supabase'

export async function fetchClientesForUsuario(usuario: Usuario): Promise<Cliente[]> {
  let query = supabase.from('clientes').select('*')

  if (usuario.rol !== 'admin') {
    query = query.eq('created_by', usuario.id)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchDeudasForClientes(
  clientes: Cliente[],
  usuario: Usuario
): Promise<{ deudas: Record<string, number>; creditos: Record<string, { mora: boolean; activo: boolean; alDia: boolean }> }> {
  if (clientes.length === 0) {
    return { deudas: {}, creditos: {} }
  }

  const clienteIds = clientes.map((cliente) => cliente.id)
  let query = supabase
    .from('prestamos')
    .select('cliente_id, monto_pendiente, estado')
    .in('cliente_id', clienteIds)

  if (usuario.rol !== 'admin') {
    query = query.eq('created_by', usuario.id)
  }

  const { data, error } = await query
  if (error) throw error

  const deudas = (data || []).reduce<Record<string, number>>((acc, prestamo) => {
    const tieneDeuda =
      prestamo.monto_pendiente > 0 &&
      prestamo.estado !== 'pagado' &&
      prestamo.estado !== 'cancelado'

    if (tieneDeuda) {
      acc[prestamo.cliente_id] =
        (acc[prestamo.cliente_id] || 0) + prestamo.monto_pendiente
    }
    return acc
  }, {})

  const creditos = (data || []).reduce<Record<string, { mora: boolean; activo: boolean; alDia: boolean }>>(
    (acc, prestamo) => {
      const current = acc[prestamo.cliente_id] || { mora: false, activo: false, alDia: false }
      const esMora = prestamo.estado === 'moroso' || prestamo.estado === 'vencido'
      const esActivo = prestamo.estado === 'activo'
      acc[prestamo.cliente_id] = {
        mora: current.mora || esMora,
        activo: current.activo || esActivo,
        alDia: current.alDia || (esActivo && !esMora),
      }
      return acc
    },
    {}
  )

  return { deudas, creditos }
}

export async function deleteClienteById(id: string): Promise<void> {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

