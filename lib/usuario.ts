import { supabase, Usuario } from './supabase'

/**
 * Garantiza que exista un registro en la tabla usuarios para el usuario de Auth.
 * Si no existe, lo crea como prestamista inactivo.
 */
export async function ensureUsuarioForAuthUser(authUser: { id: string; email?: string | null; user_metadata?: any } | null): Promise<Usuario | null> {
  if (!authUser?.email) return null

  const email = authUser.email

  // Buscar en la tabla usuarios
  const { data, error: dbError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single()

  if (dbError && (dbError as any).code === 'PGRST116') {
    // Si no existe, crear usuario básico
    const { data: newUser, error: createError } = await supabase
      .from('usuarios')
      .insert({
        id: authUser.id,
        email,
        nombre: authUser.user_metadata?.nombre || email.split('@')[0],
        apellido: authUser.user_metadata?.apellido || '',
        rol: 'prestamista',
        activo: false,
      })
      .select()
      .single()

    if (createError) throw createError
    return newUser as Usuario
  }

  if (data) {
    return data as Usuario
  }

  return null
}

