import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceRole) {
      return NextResponse.json(
        { error: 'Faltan variables de entorno para registro (SUPABASE_SERVICE_ROLE_KEY).' },
        { status: 500 }
      )
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRole)
    const body = await request.json()
    const {
      user_id,
      email,
      nombre,
      apellido,
      documento_identidad,
      celular,
      pais,
      region,
      ciudad,
      direccion,
      sexo,
      fecha_nacimiento,
    } = body || {}

    if (
      !user_id ||
      !email ||
      !nombre ||
      !apellido ||
      !documento_identidad ||
      !celular ||
      !ciudad ||
      !direccion ||
      !sexo
    ) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios para el registro.' },
        { status: 400 }
      )
    }

    if (typeof adminClient.auth.admin?.getUserById === 'function') {
      const { data: authData, error: authError } = await adminClient.auth.admin.getUserById(
        String(user_id)
      )

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }

      const authUser = authData?.user

      if (!authUser || authUser.email?.toLowerCase() !== String(email).toLowerCase()) {
        return NextResponse.json({ error: 'No se encontró el usuario en Auth.' }, { status: 404 })
      }
    }

    const { error: insertError } = await adminClient.from('usuarios').upsert(
      {
        id: user_id,
        email,
        nombre,
        apellido,
        documento_identidad,
        celular,
        pais: pais || 'Colombia',
        region: region || 'Antioquia',
        ciudad,
        direccion,
        sexo,
        fecha_nacimiento: fecha_nacimiento || null,
        rol: 'prestamista',
        activo: false,
      },
      { onConflict: 'email' }
    )

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error inesperado en registro.' },
      { status: 500 }
    )
  }
}
