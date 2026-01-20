'use client'

import { Pago, Prestamo, Cliente } from '@/lib/supabase'
import { Edit, Trash2, Calendar, DollarSign, Receipt } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PagoCardProps {
  pago: Pago & { prestamo?: Prestamo & { cliente?: Cliente } }
  onEdit: (pago: Pago) => void
  onDelete: (id: string) => void
}

export function PagoCard({ pago, onEdit, onDelete }: PagoCardProps) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">
            {pago.prestamo?.cliente?.nombre} {pago.prestamo?.cliente?.apellido}
          </h3>
          <p className="text-sm text-gray-600">
            {pago.prestamo?.cliente?.documento_identidad}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(pago)}
            className="text-primary-600 hover:text-primary-800"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(pago.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Monto:</span>
          <span className="text-2xl font-bold text-green-600">
            ${pago.monto.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-700">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(pago.fecha_pago), 'dd/MM/yyyy', { locale: es })}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-gray-700">
            <DollarSign className="h-4 w-4" />
            <span className="capitalize">{pago.metodo_pago}</span>
          </div>

          <div className="text-gray-700">
            <span className="font-medium">Tipo:</span>{' '}
            <span className="capitalize">{pago.tipo_pago}</span>
          </div>

          {pago.numero_recibo && (
            <div className="flex items-center space-x-2 text-gray-700">
              <Receipt className="h-4 w-4" />
              <span>Recibo: {pago.numero_recibo}</span>
            </div>
          )}
        </div>

        {pago.notas && (
          <div className="pt-3 border-t">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Notas:</span> {pago.notas}
            </p>
          </div>
        )}

        <div className="pt-3 border-t">
          <p className="text-xs text-gray-500">
            Préstamo: $
            {pago.prestamo?.monto_principal.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            - Pendiente: $
            {pago.prestamo?.monto_pendiente.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
