'use client'

import { Prestamo, Cliente } from '@/lib/supabase'
import { Edit, Trash2, Calendar, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
        return 'badge-info'
      case 'pagado':
        return 'badge-success'
      case 'vencido':
        return 'badge-danger'
      case 'moroso':
        return 'badge-warning'
      case 'cancelado':
        return 'badge bg-gray-100 text-gray-800'
      default:
        return 'badge bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="card-hover group">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-start space-x-4 flex-1">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {prestamo.cliente?.nombre} {prestamo.cliente?.apellido}
            </h3>
            <p className="text-sm text-gray-500 font-mono">
              {prestamo.cliente?.documento_identidad}
            </p>
          </div>
        </div>
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(prestamo)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(prestamo.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-5">
        {/* Montos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Principal</p>
            <p className="text-lg font-bold text-gray-900">
              ${prestamo.monto_principal.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-primary-50 p-3 rounded-xl">
            <p className="text-xs text-primary-600 mb-1">Total</p>
            <p className="text-lg font-bold text-primary-700">
              ${prestamo.monto_total.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Progreso de pago */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Progreso de Pago</span>
            <span className="text-sm font-bold text-primary-600">
              {porcentajePagado.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>
              Pagado: ${prestamo.monto_pagado.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-red-600 font-semibold">
              Pendiente: ${prestamo.monto_pendiente.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-sm bg-blue-50 p-2 rounded-lg">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600 font-semibold">Vence</p>
              <p className="text-gray-700 font-medium">
                {format(new Date(prestamo.fecha_vencimiento), 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm bg-purple-50 p-2 rounded-lg">
            <DollarSign className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-xs text-purple-600 font-semibold">Interés</p>
              <p className="text-gray-700 font-medium">
                {prestamo.tasa_interes}% {prestamo.tipo_interes}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
        <span className={getEstadoColor(prestamo.estado)}>
          {prestamo.estado.toUpperCase()}
        </span>
        <span className="text-xs text-gray-500 font-medium capitalize">
          {prestamo.frecuencia_pago}
        </span>
      </div>
    </div>
  )
}
