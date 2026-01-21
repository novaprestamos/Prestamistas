'use client'

import { useState, useEffect } from 'react'
import { supabase, Prestamo, Cliente } from '@/lib/supabase'
import {
  X,
  Users,
  DollarSign,
  Percent,
  Layers,
  CalendarClock,
  Calendar,
  Clock,
  FileText,
  Shield,
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { useUsuario } from '@/lib/useUsuario'
import { notifyError, notifySuccess } from '@/lib/notify'

interface PrestamoFormProps {
  prestamo?: Prestamo | null
  clientes: Cliente[]
  onClose: () => void
}

export function PrestamoForm({ prestamo, clientes, onClose }: PrestamoFormProps) {
  const { usuario } = useUsuario()
  const [formData, setFormData] = useState({
    cliente_id: '',
    monto_principal: '',
    tasa_interes: '5.0',
    tipo_interes: 'simple' as 'simple' | 'compuesto',
    plazo_dias: '30',
    fecha_inicio: format(new Date(), 'yyyy-MM-dd'),
    frecuencia_pago: 'diario' as 'diario' | 'semanal' | 'quincenal' | 'mensual',
    descripcion: '',
    garantia: '',
  })

  const [montoTotal, setMontoTotal] = useState(0)
  const [defaultTasa, setDefaultTasa] = useState<string | null>(null)
  const [tasaTouched, setTasaTouched] = useState(false)

  useEffect(() => {
    if (prestamo) {
      setFormData({
        cliente_id: prestamo.cliente_id,
        monto_principal: prestamo.monto_principal.toString(),
        tasa_interes: prestamo.tasa_interes.toString(),
        tipo_interes: prestamo.tipo_interes,
        plazo_dias: prestamo.plazo_dias.toString(),
        fecha_inicio: prestamo.fecha_inicio,
        frecuencia_pago: prestamo.frecuencia_pago,
        descripcion: prestamo.descripcion || '',
        garantia: prestamo.garantia || '',
      })
      setMontoTotal(prestamo.monto_total)
    }
  }, [prestamo])

  useEffect(() => {
    const loadDefaultTasa = async () => {
      try {
        const { data, error } = await supabase
          .from('configuracion')
          .select('valor')
          .eq('clave', 'tasa_interes_default')
          .single()

        if (error) throw error
        const valor = data?.valor ?? null
        setDefaultTasa(valor)

        if (!prestamo && valor && !tasaTouched) {
          setFormData((prev) => ({ ...prev, tasa_interes: valor }))
        }
      } catch (error) {
        console.error('Error cargando tasa por defecto:', error)
        notifyError('Error al cargar la tasa por defecto')
      }
    }

    loadDefaultTasa()
  }, [prestamo, tasaTouched])

  useEffect(() => {
    calcularMontoTotal()
  }, [formData.monto_principal, formData.tasa_interes, formData.plazo_dias, formData.tipo_interes])

  const calcularMontoTotal = () => {
    const principal = parseFloat(formData.monto_principal) || 0
    const tasa = parseFloat(formData.tasa_interes) || 0
    const plazo = parseInt(formData.plazo_dias) || 0

    if (principal > 0 && plazo > 0) {
      let total = 0
      if (formData.tipo_interes === 'simple') {
        total = principal * (1 + (tasa / 100) * (plazo / 30.0))
      } else {
        // Interés compuesto (mensual)
        total = principal * Math.pow(1 + (tasa / 100), plazo / 30.0)
      }
      setMontoTotal(Math.round(total * 100) / 100)
    } else {
      setMontoTotal(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const fechaInicio = new Date(formData.fecha_inicio)
      const fechaVencimiento = addDays(fechaInicio, parseInt(formData.plazo_dias))

      const prestamoData = {
        cliente_id: formData.cliente_id,
        monto_principal: parseFloat(formData.monto_principal),
        tasa_interes: parseFloat(formData.tasa_interes),
        tipo_interes: formData.tipo_interes,
        plazo_dias: parseInt(formData.plazo_dias),
        fecha_inicio: formData.fecha_inicio,
        fecha_vencimiento: format(fechaVencimiento, 'yyyy-MM-dd'),
        monto_total: montoTotal,
        monto_pagado: prestamo?.monto_pagado || 0,
        monto_pendiente: montoTotal - (prestamo?.monto_pagado || 0),
        estado: prestamo?.estado || 'activo',
        frecuencia_pago: formData.frecuencia_pago,
        descripcion: formData.descripcion || null,
        garantia: formData.garantia || null,
      }

      if (prestamo) {
        // Actualizar
        const { error } = await supabase
          .from('prestamos')
          .update(prestamoData)
          .eq('id', prestamo.id)

        if (error) throw error
        notifySuccess('Préstamo actualizado exitosamente')
      } else {
        // Crear
        const { error } = await supabase
          .from('prestamos')
          .insert([{
            ...prestamoData,
            created_by: usuario?.id || null,
          }])

        if (error) throw error
        notifySuccess('Préstamo creado exitosamente')
      }

      onClose()
    } catch (error: any) {
      console.error('Error guardando préstamo:', error)
      notifyError(error?.message ? `Error: ${error.message}` : 'Error al guardar préstamo')
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">
            {prestamo ? 'Editar Préstamo' : 'Nuevo Préstamo'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="icon-button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div>
            <label className="block text-sm font-medium mb-1">Cliente *</label>
            <div className="field-wrap">
              <Users className="field-icon" />
              <select
                required
                value={formData.cliente_id}
                onChange={(e) =>
                  setFormData({ ...formData, cliente_id: e.target.value })
                }
                className="input field-input"
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} {cliente.apellido} - {cliente.documento_identidad}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Monto Principal *
              </label>
              <div className="field-wrap">
                <DollarSign className="field-icon" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.monto_principal}
                  onChange={(e) =>
                    setFormData({ ...formData, monto_principal: e.target.value })
                  }
                  className="input field-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tasa de Interés (%) *
              </label>
              {defaultTasa && (
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                  <span>Por defecto: {defaultTasa}%</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, tasa_interes: defaultTasa }))
                      setTasaTouched(false)
                    }}
                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Aplicar
                  </button>
                </div>
              )}
              <div className="field-wrap">
                <Percent className="field-icon" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={formData.tasa_interes}
                  onChange={(e) =>
                    setFormData({ ...formData, tasa_interes: e.target.value })
                  }
                  className="input field-input"
                  onInput={() => setTasaTouched(true)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de Interés *
              </label>
              <div className="field-wrap">
                <Layers className="field-icon" />
                <select
                  value={formData.tipo_interes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipo_interes: e.target.value as 'simple' | 'compuesto',
                    })
                  }
                  className="input field-input"
                >
                  <option value="simple">Simple</option>
                  <option value="compuesto">Compuesto</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Plazo (días) *
              </label>
              <div className="field-wrap">
                <CalendarClock className="field-icon" />
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.plazo_dias}
                  onChange={(e) =>
                    setFormData({ ...formData, plazo_dias: e.target.value })
                  }
                  className="input field-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha de Inicio *
              </label>
              <div className="field-wrap">
                <Calendar className="field-icon" />
                <input
                  type="date"
                  required
                  value={formData.fecha_inicio}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_inicio: e.target.value })
                  }
                  className="input field-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Frecuencia de Pago *
              </label>
              <div className="field-wrap">
                <Clock className="field-icon" />
                <select
                  value={formData.frecuencia_pago}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      frecuencia_pago: e.target.value as any,
                    })
                  }
                  className="input field-input"
                >
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
            </div>
          </div>

          <div className="loan-summary">
            <div className="loan-summary-row">
              <span className="loan-summary-label">Monto Total a Pagar:</span>
              <span className="loan-summary-value">
                ${montoTotal.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <p className="loan-summary-note">
              Interés: $
              {(montoTotal - (parseFloat(formData.monto_principal) || 0)).toLocaleString(
                'es-ES',
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <div className="field-wrap">
              <FileText className="field-icon" />
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className="input field-textarea"
                rows={2}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Garantía</label>
            <div className="field-wrap">
              <Shield className="field-icon" />
              <textarea
                value={formData.garantia}
                onChange={(e) =>
                  setFormData({ ...formData, garantia: e.target.value })
                }
                className="input field-textarea"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {prestamo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
