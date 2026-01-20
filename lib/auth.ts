'use client'

import { supabase } from './supabase'
import { Usuario } from './supabase'

export async function getCurrentUser(): Promise<Usuario | null> {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser?.email) return null

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', authUser.email)
      .single()

    return usuario
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error)
    return null
  }
}

export async function isAdmin(): Promise<boolean> {
  const usuario = await getCurrentUser()
  return usuario?.rol === 'admin'
}

export async function logout() {
  await supabase.auth.signOut()
  window.location.href = '/login'
}
