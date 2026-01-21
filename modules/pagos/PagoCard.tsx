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
    <div className="data-card">
      <div className="data-card-header">
        <div>
          <div className="data-title">
            {pago.prestamo?.cliente?.nombre} {pago.prestamo?.cliente?.apellido}
          </div>
          <div className="data-subtitle">{pago.prestamo?.cliente?.documento_identidad}</div>
        </div>
        <div className="data-actions">
          <button
            type="button"
            onClick={() => onEdit(pago)}
            className="icon-button icon-button-soft"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(pago.id)}
            className="icon-button icon-button-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="data-badges">
        <span className="data-badge">{pago.tipo_pago}</span>
        <span className="data-badge data-badge-success">{pago.metodo_pago}</span>
        {pago.numero_recibo && <span className="data-badge">Recibo {pago.numero_recibo}</span>}
      </div>

      <div className="data-card-body">
        <div className="data-row">
          <DollarSign className="h-4 w-4" />
          <span>
            Monto: ${pago.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="data-row">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(pago.fecha_pago), 'dd/MM/yyyy', { locale: es })}</span>
        </div>

        <div className="data-row">
          <DollarSign className="h-4 w-4" />
          <span className="capitalize">Método: {pago.metodo_pago}</span>
        </div>

        <div className="data-row">
          <Receipt className="h-4 w-4" />
          <span className="capitalize">Tipo: {pago.tipo_pago}</span>
        </div>

        {pago.notas && (
          <div className="data-row">
            <span className="data-pill">Notas</span>
            <span>{pago.notas}</span>
          </div>
        )}
      </div>

      <div className="data-card-footer">
        <span className="data-pill">
          Préstamo: ${pago.prestamo?.monto_principal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </span>
        <span className="data-pill data-pill-warning">
          Pendiente: ${pago.prestamo?.monto_pendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}
