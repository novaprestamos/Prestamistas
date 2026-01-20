'use client'

import { useState, useEffect } from 'react'
import { supabase, Usuario } from './supabase'

export function useUsuario() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUsuario()
  }, [])

  const loadUsuario = async () => {
    try {
      setLoading(true)
      setError(null)

      // Intentar obtener usuario desde Supabase Auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authUser?.email) {
        // Buscar en la tabla usuarios
        const { data, error: dbError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', authUser.email)
          .single()

        if (dbError && dbError.code === 'PGRST116') {
          // Si no existe, crear usuario básico
          const { data: newUser, error: createError } = await supabase
            .from('usuarios')
            .insert({
              id: authUser.id,
              email: authUser.email,
              nombre: authUser.user_metadata?.nombre || authUser.email.split('@')[0],
              apellido: authUser.user_metadata?.apellido || '',
              rol: 'prestamista',
              activo: false,
            })
            .select()
            .single()

          if (createError) throw createError
          setUsuario(newUser)
        } else if (data) {
          if (data.activo === false) {
            await supabase.auth.signOut()
            setUsuario(null)
            setError('Tu cuenta está pendiente de aprobación.')
            return
          }
          setUsuario(data)
        }
      } else {
        // Modo desarrollo: cargar primer usuario disponible
        const { data: usuarios } = await supabase
          .from('usuarios')
          .select('*')
          .limit(1)
          .single()

        if (usuarios) {
          setUsuario(usuarios)
        } else {
          setError('No se encontró ningún usuario')
        }
      }
    } catch (err: any) {
      console.error('Error cargando usuario:', err)
      setError(err.message || 'Error al cargar usuario')
    } finally {
      setLoading(false)
    }
  }

  const updateUsuario = async (updates: Partial<Usuario>) => {
    if (!usuario) return

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', usuario.id)
        .select()
        .single()

      if (error) throw error
      setUsuario(data)
      return data
    } catch (err: any) {
      console.error('Error actualizando usuario:', err)
      throw err
    }
  }

  return {
    usuario,
    loading,
    error,
    updateUsuario,
    reload: loadUsuario,
  }
}
