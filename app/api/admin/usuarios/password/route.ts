import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const { userId, password } = await request.json()

    if (!userId || !password) {
      return NextResponse.json({ error: 'userId y password son requeridos' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password })

    if (error) {
      console.error('Error actualizando contraseña (admin):', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Error en API de actualización de contraseña:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar la contraseña' },
      { status: 500 }
    )
  }
}

