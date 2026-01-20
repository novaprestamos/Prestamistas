'use client'

import { Usuario } from '@/lib/supabase'
import { Edit, Trash2, Mail, Shield, User as UserIcon } from 'lucide-react'

interface UsuarioCardProps {
  usuario: Usuario
  onEdit: (usuario: Usuario) => void
  onDelete: (id: string) => void
  onApprove: (id: string) => void
  currentUserId?: string
}

export function UsuarioCard({ usuario, onEdit, onDelete, onApprove, currentUserId }: UsuarioCardProps) {
  const getRolLabel = (rol: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      prestamista: 'Prestamista',
      operador: 'Operador',
    }
    return labels[rol] || rol
  }

  const getRolColor = (rol: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      prestamista: 'bg-blue-100 text-blue-800',
      operador: 'bg-green-100 text-green-800',
    }
    return colors[rol] || 'bg-gray-100 text-gray-800'
  }

  const isCurrentUser = usuario.id === currentUserId

  return (
    <div className={`card hover:shadow-lg transition-shadow ${isCurrentUser ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-3 rounded-full">
            <UserIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold">
              {usuario.nombre} {usuario.apellido}
            </h3>
            {isCurrentUser && (
              <span className="text-xs text-primary-600 font-medium">(Tú)</span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {!usuario.activo && (
            <button
              onClick={() => onApprove(usuario.id)}
              className="text-emerald-600 hover:text-emerald-800"
              title="Aprobar acceso"
            >
              <Shield className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => onEdit(usuario)}
            className="text-primary-600 hover:text-primary-800"
          >
            <Edit className="h-5 w-5" />
          </button>
          {!isCurrentUser && (
            <button
              onClick={() => onDelete(usuario.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2 text-gray-700">
          <Mail className="h-4 w-4" />
          <span>{usuario.email}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-700">
          <Shield className="h-4 w-4" />
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRolColor(
              usuario.rol
            )}`}
          >
            {getRolLabel(usuario.rol)}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <span
          className={`inline-block px-2 py-1 rounded text-xs ${
            usuario.activo
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {usuario.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    </div>
  )
}
