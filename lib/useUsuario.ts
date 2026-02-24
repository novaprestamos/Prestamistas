'use client'

import { useState, useEffect } from 'react'
import { supabase, Usuario } from './supabase'
import { ensureUsuarioForAuthUser } from './usuario'

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
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        setUsuario(null)
        return
      }

      const usuarioDb = await ensureUsuarioForAuthUser(authUser)

      if (usuarioDb) {
        if (usuarioDb.activo === false) {
          await supabase.auth.signOut()
          setUsuario(null)
          setError('Tu cuenta está pendiente de aprobación.')
          return
        }
        setUsuario(usuarioDb)
      } else {
        setUsuario(null)
        setError('No se encontró ningún usuario asociado a esta cuenta.')
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
