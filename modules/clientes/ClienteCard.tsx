'use client'

import { Cliente } from '@/lib/supabase'
import { Edit, Trash2, Phone, Mail, MapPin, User, Briefcase, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

interface ClienteCardProps {
  cliente: Cliente
  deudaPendiente?: number
  onEdit: (cliente: Cliente) => void
  onDelete: (id: string) => void
}

export function ClienteCard({ cliente, deudaPendiente = 0, onEdit, onDelete }: ClienteCardProps) {
  const iniciales = `${cliente.nombre?.[0] || ''}${cliente.apellido?.[0] || ''}`
    .toUpperCase()
    .trim()

  const deudaTexto =
    deudaPendiente > 0 ? `Debe $${formatCurrency(deudaPendiente)}` : 'Sin deuda'

  return (
    <div className="data-card data-card-compact">
      <div className="data-card-header">
        <div className="customer-identity">
          <div className={`customer-avatar ${cliente.avatar_url ? 'has-image' : ''}`}>
            {cliente.avatar_url ? (
              <img src={cliente.avatar_url} alt={`${cliente.nombre} ${cliente.apellido}`} />
            ) : iniciales ? (
              <span>{iniciales}</span>
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="data-title">
              {cliente.nombre} {cliente.apellido}
            </div>
            <div className="data-subtitle">Documento: {cliente.documento_identidad}</div>
          </div>
        </div>
        <div className="data-actions">
          <button
            type="button"
            onClick={() => onEdit(cliente)}
            className="icon-button icon-button-soft"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(cliente.id)}
            className="icon-button icon-button-danger"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="data-badges">
        <span className={`data-badge ${cliente.activo ? 'data-badge-success' : 'data-badge-danger'}`}>
          {cliente.activo ? 'Activo' : 'Inactivo'}
        </span>
        <span className={`data-badge ${deudaPendiente > 0 ? 'data-badge-warning' : 'data-badge-success'}`}>
          {deudaTexto}
        </span>
      </div>

      <div className="data-card-body">
        <div className="data-row">
          <Phone className="h-4 w-4" />
          <span>
            Contacto: {cliente.telefono ? cliente.telefono : 'Sin contacto'}
          </span>
        </div>
        {cliente.email && (
          <div className="data-row">
            <Mail className="h-4 w-4" />
            <span>{cliente.email}</span>
          </div>
        )}
        {cliente.direccion && (
          <div className="data-row">
            <MapPin className="h-4 w-4" />
            <span>{cliente.direccion}</span>
          </div>
        )}
        {cliente.ocupacion && (
          <div className="data-row">
            <Briefcase className="h-4 w-4" />
            <span>{cliente.ocupacion}</span>
          </div>
        )}
        <div className="data-row">
          <DollarSign className="h-4 w-4" />
          <span>{deudaTexto}</span>
        </div>
      </div>
    </div>
  )
}
