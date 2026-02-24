'use client'

import { Prestamo, Cliente } from '@/lib/supabase'
import { Edit, Trash2, Calendar, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCurrency } from '@/lib/format'

interface PrestamoCardProps {
  prestamo: Prestamo & { cliente?: Cliente }
  onEdit: (prestamo: Prestamo) => void
  onDelete: (id: string) => void
}

export function PrestamoCard({ prestamo, onEdit, onDelete }: PrestamoCardProps) {
  const porcentajePagado =
    prestamo.monto_total > 0
      ? (prestamo.monto_pagado / prestamo.monto_total) * 100
      : 0

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'data-badge data-badge-success'
      case 'pagado':
        return 'data-badge data-badge-success'
      case 'vencido':
        return 'data-badge data-badge-danger'
      case 'moroso':
        return 'data-badge data-badge-warning'
      case 'cancelado':
        return 'data-badge'
      default:
        return 'data-badge'
    }
  }

  return (
    <div className="data-card">
      <div className="data-card-header">
        <div>
          <div className="data-title">
            {prestamo.cliente?.nombre} {prestamo.cliente?.apellido}
          </div>
          <div className="data-subtitle">{prestamo.cliente?.documento_identidad}</div>
        </div>
        <div className="data-actions">
          <button
            type="button"
            onClick={() => onEdit(prestamo)}
            className="icon-button icon-button-soft"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(prestamo.id)}
            className="icon-button icon-button-danger"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="data-badges">
        <span className={getEstadoColor(prestamo.estado)}>
          {prestamo.estado.toUpperCase()}
        </span>
        <span className="data-badge">{prestamo.frecuencia_pago}</span>
      </div>

      <div className="data-card-body">
        <div className="data-row">
          <DollarSign className="h-4 w-4" />
          <span>Principal: ${formatCurrency(prestamo.monto_principal)}</span>
        </div>
        <div className="data-row">
          <DollarSign className="h-4 w-4" />
          <span>Total: ${formatCurrency(prestamo.monto_total)}</span>
        </div>
        <div className="data-row">
          <DollarSign className="h-4 w-4" />
          <span>Pendiente: ${formatCurrency(prestamo.monto_pendiente)}</span>
        </div>

        <div>
          <div className="data-row data-row-split">
            <span>Progreso de pago</span>
            <span className="data-pill">{porcentajePagado.toFixed(1)}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-bar"
              style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
            />
          </div>
        </div>

        <div className="data-row">
          <Calendar className="h-4 w-4" />
          <span>
            Vence: {format(new Date(prestamo.fecha_vencimiento), 'dd/MM/yyyy', { locale: es })}
          </span>
        </div>

        <div className="data-row">
          <DollarSign className="h-4 w-4" />
          <span>
            Interés: {prestamo.tasa_interes}% {prestamo.tipo_interes}
          </span>
        </div>
      </div>

      <div className="data-card-footer">
        <span className="data-pill">Vence {format(new Date(prestamo.fecha_vencimiento), 'dd/MM/yyyy', { locale: es })}</span>
        <span className="data-pill data-pill-warning">Pagado ${formatCurrency(prestamo.monto_pagado)}</span>
      </div>
    </div>
  )
}
