'use client'

import { Cliente } from '@/lib/supabase'
import { Edit, Trash2, Phone, Mail, MapPin, User } from 'lucide-react'

interface ClienteCardProps {
  cliente: Cliente
  onEdit: (cliente: Cliente) => void
  onDelete: (id: string) => void
}

export function ClienteCard({ cliente, onEdit, onDelete }: ClienteCardProps) {
  return (
    <div className="card-hover group">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {cliente.nombre} {cliente.apellido}
            </h3>
            <p className="text-sm text-gray-500 font-mono">ID: {cliente.documento_identidad}</p>
          </div>
        </div>
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(cliente)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(cliente.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        {cliente.telefono && (
          <div className="flex items-center space-x-3 text-gray-700 bg-gray-50 p-2 rounded-lg">
            <Phone className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium">{cliente.telefono}</span>
          </div>
        )}
        {cliente.email && (
          <div className="flex items-center space-x-3 text-gray-700 bg-gray-50 p-2 rounded-lg">
            <Mail className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium truncate">{cliente.email}</span>
          </div>
        )}
        {cliente.direccion && (
          <div className="flex items-center space-x-3 text-gray-700 bg-gray-50 p-2 rounded-lg">
            <MapPin className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium">{cliente.direccion}</span>
          </div>
        )}
        {cliente.ocupacion && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-blue-700">Ocupación:</span>{' '}
              <span className="text-gray-600">{cliente.ocupacion}</span>
            </p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
        <span
          className={`badge ${
            cliente.activo ? 'badge-success' : 'badge-danger'
          }`}
        >
          {cliente.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    </div>
  )
}
