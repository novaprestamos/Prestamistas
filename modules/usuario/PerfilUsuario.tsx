'use client'

import { useEffect, useState } from 'react'
import { useUsuario } from '@/lib/useUsuario'
import { User, Mail, Shield, Calendar, Edit, Save, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function PerfilUsuario() {
  const { usuario, loading, updateUsuario } = useUsuario()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rol: '' as 'admin' | 'prestamista' | 'operador',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        apellido: usuario.apellido || '',
        email: usuario.email,
        rol: usuario.rol,
      })
    }
  }, [usuario])

  const handleSave = async () => {
    if (!usuario) return

    try {
      setSaving(true)
      await updateUsuario({
        nombre: formData.nombre,
        apellido: formData.apellido || undefined,
      })

      setEditing(false)
      alert('Perfil actualizado exitosamente')
    } catch (error: any) {
      console.error('Error actualizando perfil:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        apellido: usuario.apellido || '',
        email: usuario.email,
        rol: usuario.rol,
      })
    }
    setEditing(false)
  }

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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando perfil...</p>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Usuario no encontrado</h2>
        <p className="text-gray-600">
          No se pudo cargar la información del usuario. Por favor, inicia sesión.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Edit className="h-5 w-5" />
            <span>Editar Perfil</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <X className="h-5 w-5" />
              <span>Cancelar</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>{saving ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Principal */}
        <div className="card">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-primary-100 p-4 rounded-full">
              <User className="h-12 w-12 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {usuario.nombre} {usuario.apellido}
              </h2>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRolColor(
                  usuario.rol
                )}`}
              >
                {getRolLabel(usuario.rol)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="input mt-1 bg-gray-100"
                    title="El email no se puede modificar"
                  />
                ) : (
                  <p className="font-medium">{usuario.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Rol</p>
                <p className="font-medium">{getRolLabel(usuario.rol)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Miembro desde</p>
                <p className="font-medium">
                  {format(new Date(usuario.created_at), "dd 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Edición */}
        {editing && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Editar Información</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Apellido</label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) =>
                    setFormData({ ...formData, apellido: e.target.value })
                  }
                  className="input"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> El email y el rol no se pueden modificar desde aquí.
                  Contacta a un administrador si necesitas cambiar estos datos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información Adicional */}
        {!editing && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Información Adicional</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Estado</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    usuario.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Última actualización</p>
                <p className="font-medium">
                  {format(new Date(usuario.updated_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                    locale: es,
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">ID de Usuario</p>
                <p className="font-mono text-xs text-gray-500 break-all">{usuario.id}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
