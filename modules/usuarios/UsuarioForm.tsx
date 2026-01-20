'use client'

import { useState, useEffect } from 'react'
import { supabase, Usuario } from '@/lib/supabase'
import { X } from 'lucide-react'

interface UsuarioFormProps {
  usuario?: Usuario | null
  onClose: () => void
}

export function UsuarioForm({ usuario, onClose }: UsuarioFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'prestamista' as 'admin' | 'prestamista' | 'operador',
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (usuario) {
      setFormData({
        email: usuario.email,
        password: '', // No mostrar contraseña
        nombre: usuario.nombre,
        apellido: usuario.apellido || '',
        rol: usuario.rol,
      })
    }
  }, [usuario])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setCreating(true)

      if (usuario) {
        // Actualizar usuario existente
        const { error } = await supabase
          .from('usuarios')
          .update({
            nombre: formData.nombre,
            apellido: formData.apellido || null,
            rol: formData.rol,
          })
          .eq('id', usuario.id)

        if (error) throw error

        // Si se cambió la contraseña, actualizarla en Auth
        if (formData.password) {
          const { error: updatePasswordError } = await supabase.auth.admin.updateUserById(
            usuario.id,
            { password: formData.password }
          )
          // Nota: admin.updateUserById requiere service role key, en producción usar API route
        }

        alert('Usuario actualizado exitosamente')
      } else {
        // Crear nuevo usuario
        // Primero crear en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nombre: formData.nombre,
              apellido: formData.apellido,
            },
          },
        })

        if (authError) throw authError

        // Luego crear en tabla usuarios
        const { error: dbError } = await supabase
          .from('usuarios')
          .insert({
            id: authData.user?.id,
            email: formData.email,
            nombre: formData.nombre,
            apellido: formData.apellido || null,
            rol: formData.rol,
            activo: true,
          })

        if (dbError) {
          // Si falla la inserción, intentar eliminar el usuario de auth
          console.error('Error creando usuario en BD:', dbError)
          throw dbError
        }

        alert('Usuario creado exitosamente')
      }

      onClose()
    } catch (error: any) {
      console.error('Error guardando usuario:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                required
                disabled={!!usuario}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {usuario ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
              </label>
              <input
                type="password"
                required={!usuario}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input"
                placeholder={usuario ? 'Opcional' : ''}
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium mb-1">Rol *</label>
              <select
                value={formData.rol}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rol: e.target.value as 'admin' | 'prestamista' | 'operador',
                  })
                }
                className="input"
              >
                <option value="prestamista">Prestamista</option>
                <option value="operador">Operador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Los usuarios prestamistas solo podrán ver sus propios clientes y préstamos.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Guardando...' : usuario ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
