import { supabase, Prestamo, Cliente, Usuario } from './supabase'

export async function fetchClientesActivosParaPrestamos(usuario: Usuario): Promise<Cliente[]> {
  let query = supabase
    .from('clientes')
    .select('*')
    .eq('activo', true)

  if (usuario.rol !== 'admin') {
    query = query.eq('created_by', usuario.id)
  }

  const { data, error } = await query.order('nombre')
  if (error) throw error
  return data || []
}

export async function fetchPrestamosForUsuario(usuario: Usuario): Promise<(Prestamo & { cliente?: Cliente })[]> {
  let query = supabase
    .from('prestamos')
    .select(`
      *,
      cliente:clientes(*)
    `)

  if (usuario.rol !== 'admin') {
    query = query.eq('created_by', usuario.id)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as any
}

export async function deletePrestamoById(id: string): Promise<void> {
  const { error } = await supabase
    .from('prestamos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

