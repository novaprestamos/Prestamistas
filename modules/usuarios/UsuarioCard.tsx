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
  const iniciales = `${usuario.nombre?.[0] || ''}${usuario.apellido?.[0] || ''}`.toUpperCase().trim()

  return (
    <div className={`user-card ${isCurrentUser ? 'user-card-highlight' : ''}`}>
      <div className="user-card-header">
        <div className="user-card-identity">
          <div className={`user-avatar ${usuario.avatar_url ? 'has-image' : ''}`}>
            {usuario.avatar_url ? (
              <img src={usuario.avatar_url} alt={`${usuario.nombre} ${usuario.apellido}`} />
            ) : iniciales ? (
              <span>{iniciales}</span>
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
          </div>
          <div>
            <div className="user-card-title">
              {usuario.nombre} {usuario.apellido}
            </div>
            <div className="user-card-subtitle">{usuario.email}</div>
          </div>
        </div>
        <div className="data-actions">
          {!usuario.activo && (
            <button
              type="button"
              onClick={() => onApprove(usuario.id)}
              className="icon-button icon-button-soft"
              title="Aprobar acceso"
            >
              <Shield className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(usuario)}
            className="icon-button icon-button-soft"
          >
            <Edit className="h-4 w-4" />
          </button>
          {!isCurrentUser && (
            <button
              type="button"
              onClick={() => onDelete(usuario.id)}
              className="icon-button icon-button-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="user-card-badges">
        <span className="user-chip">{getRolLabel(usuario.rol)}</span>
        <span className={`user-chip ${usuario.activo ? 'user-chip-success' : 'user-chip-warning'}`}>
          {usuario.activo ? 'Activo' : 'Pendiente'}
        </span>
        {isCurrentUser && <span className="user-chip user-chip-success">Tú</span>}
      </div>

      <div className="user-card-body">
        <div className="user-row">
          <UserIcon className="h-4 w-4" />
          <span>{getRolLabel(usuario.rol)}</span>
        </div>
        <div className="user-row">
          <Shield className="h-4 w-4" />
          <span>{usuario.activo ? 'Activo' : 'Pendiente'}</span>
        </div>
        <div className="user-row">
          <Mail className="h-4 w-4" />
          <span>{usuario.email}</span>
        </div>
      </div>

      <div className="user-card-footer">
        <span className="user-pill">{usuario.activo ? 'Acceso habilitado' : 'Pendiente de aprobación'}</span>
      </div>
    </div>
  )
}
