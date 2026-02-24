'use client'

import { useState, useEffect } from 'react'
import { supabase, Pago, Prestamo } from '@/lib/supabase'
import { X, FileText, DollarSign, Calendar, ClipboardList, CreditCard, Receipt, StickyNote } from 'lucide-react'
import { format } from 'date-fns'
import { notifyError, notifySuccess } from '@/lib/notify'
import { formatCurrency } from '@/lib/format'

interface PagoFormProps {
  pago?: Pago | null
  prestamos: Prestamo[]
  onClose: () => void
}

export function PagoForm({ pago, prestamos, onClose }: PagoFormProps) {
  const [formData, setFormData] = useState({
    prestamo_id: '',
    monto: '',
    fecha_pago: format(new Date(), 'yyyy-MM-dd'),
    tipo_pago: 'normal' as 'normal' | 'adelantado' | 'parcial' | 'completo',
    metodo_pago: 'efectivo' as 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta',
    numero_recibo: '',
    notas: '',
  })

  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null)

  useEffect(() => {
    if (pago) {
      setFormData({
        prestamo_id: pago.prestamo_id,
        monto: pago.monto.toString(),
        fecha_pago: pago.fecha_pago,
        tipo_pago: pago.tipo_pago,
        metodo_pago: pago.metodo_pago,
        numero_recibo: pago.numero_recibo || '',
        notas: pago.notas || '',
      })
    }
  }, [pago])

  useEffect(() => {
    const prestamo = prestamos.find((p) => p.id === formData.prestamo_id)
    setPrestamoSeleccionado(prestamo || null)
  }, [formData.prestamo_id, prestamos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const pagoData = {
        prestamo_id: formData.prestamo_id,
        monto: parseFloat(formData.monto),
        fecha_pago: formData.fecha_pago,
        tipo_pago: formData.tipo_pago,
        metodo_pago: formData.metodo_pago,
        numero_recibo: formData.numero_recibo || null,
        notas: formData.notas || null,
      }

      if (pago) {
        // Actualizar
        const { error } = await supabase
          .from('pagos')
          .update(pagoData)
          .eq('id', pago.id)

        if (error) throw error
        notifySuccess('Pago actualizado exitosamente')
      } else {
        // Crear
        const { error } = await supabase
          .from('pagos')
          .insert([pagoData])

        if (error) throw error
        notifySuccess('Pago registrado exitosamente')
      }

      onClose()
    } catch (error: any) {
      console.error('Error guardando pago:', error)
      notifyError(error?.message ? `Error: ${error.message}` : 'Error al guardar pago')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {pago ? 'Editar Pago' : 'Registrar Pago'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Préstamo *</label>
            <div className="field-wrap">
              <FileText className="field-icon" />
              <select
                required
                value={formData.prestamo_id}
                onChange={(e) =>
                  setFormData({ ...formData, prestamo_id: e.target.value })
                }
                className="input field-input"
              >
                <option value="">Seleccionar préstamo...</option>
                {prestamos.map((prestamo) => (
                  <option key={prestamo.id} value={prestamo.id}>
                    Cliente ID: {prestamo.cliente_id} - Monto: $
                {formatCurrency(prestamo.monto_principal)}{' '}
                    - Pendiente: $
                    {formatCurrency(prestamo.monto_pendiente)}
                  </option>
                ))}
              </select>
            </div>
            {prestamoSeleccionado && (
              <p className="text-sm text-gray-600 mt-1">
                Pendiente: ${formatCurrency(prestamoSeleccionado.monto_pendiente)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monto *</label>
              <div className="field-wrap">
                <DollarSign className="field-icon" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={prestamoSeleccionado?.monto_pendiente || undefined}
                  required
                  value={formData.monto}
                  onChange={(e) =>
                    setFormData({ ...formData, monto: e.target.value })
                  }
                  className="input field-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha de Pago *
              </label>
              <div className="field-wrap">
                <Calendar className="field-icon" />
                <input
                  type="date"
                  required
                  value={formData.fecha_pago}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_pago: e.target.value })
                  }
                  className="input field-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de Pago *
              </label>
              <div className="field-wrap">
                <ClipboardList className="field-icon" />
                <select
                  value={formData.tipo_pago}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipo_pago: e.target.value as any,
                    })
                  }
                  className="input field-input"
                >
                  <option value="normal">Normal</option>
                  <option value="adelantado">Adelantado</option>
                  <option value="parcial">Parcial</option>
                  <option value="completo">Completo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Método de Pago *
              </label>
              <div className="field-wrap">
                <CreditCard className="field-icon" />
                <select
                  value={formData.metodo_pago}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metodo_pago: e.target.value as any,
                    })
                  }
                  className="input field-input"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Número de Recibo
            </label>
            <div className="field-wrap">
              <Receipt className="field-icon" />
              <input
                type="text"
                value={formData.numero_recibo}
                onChange={(e) =>
                  setFormData({ ...formData, numero_recibo: e.target.value })
                }
                className="input field-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <div className="field-wrap">
              <StickyNote className="field-icon" />
              <textarea
                value={formData.notas}
                onChange={(e) =>
                  setFormData({ ...formData, notas: e.target.value })
                }
                className="input field-textarea"
                rows={3}
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
              {pago ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
