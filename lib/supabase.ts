import { createClient } from '@supabase/supabase-js'

// Leer variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validar que las variables estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === 'undefined') {
    // En el servidor, lanzar error
    throw new Error(
      'Faltan las variables de entorno de Supabase. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env'
    )
  } else {
    // En el cliente, mostrar error en consola
    console.error(
      'Error: Faltan las variables de entorno de Supabase.\n' +
      'Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env'
    )
  }
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript para las tablas
export interface Usuario {
  id: string
  email: string
  nombre: string
  apellido?: string
  documento_identidad?: string
  celular?: string
  pais?: string
  region?: string
  ciudad?: string
  direccion?: string
  sexo?: 'masculino' | 'femenino' | 'otro'
  fecha_nacimiento?: string
  rol: 'admin' | 'prestamista' | 'operador'
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  documento_identidad: string
  nombre: string
  apellido: string
  telefono?: string
  email?: string
  direccion?: string
  fecha_nacimiento?: string
  estado_civil?: string
  ocupacion?: string
  referencias?: string
  notas?: string
  activo: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export interface Prestamo {
  id: string
  cliente_id: string
  monto_principal: number
  tasa_interes: number
  tipo_interes: 'simple' | 'compuesto'
  plazo_dias: number
  fecha_inicio: string
  fecha_vencimiento: string
  monto_total: number
  monto_pagado: number
  monto_pendiente: number
  estado: 'activo' | 'pagado' | 'vencido' | 'cancelado' | 'moroso'
  frecuencia_pago: 'diario' | 'semanal' | 'quincenal' | 'mensual'
  descripcion?: string
  garantia?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface Pago {
  id: string
  prestamo_id: string
  monto: number
  fecha_pago: string
  tipo_pago: 'normal' | 'adelantado' | 'parcial' | 'completo'
  metodo_pago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta'
  numero_recibo?: string
  notas?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface Configuracion {
  id: string
  clave: string
  valor: string
  tipo: 'texto' | 'numero' | 'booleano' | 'fecha'
  descripcion?: string
  created_at: string
  updated_at: string
}
