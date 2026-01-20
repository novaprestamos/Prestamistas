'use client'

import { useState, useEffect } from 'react'
import { supabase, Cliente } from '@/lib/supabase'
import { X } from 'lucide-react'
import { useUsuario } from '@/lib/useUsuario'

interface ClienteFormProps {
  cliente?: Cliente | null
  onClose: () => void
}

export function ClienteForm({ cliente, onClose }: ClienteFormProps) {
  const { usuario } = useUsuario()
  const [formData, setFormData] = useState({
    documento_identidad: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    fecha_nacimiento: '',
    estado_civil: '',
    ocupacion: '',
    referencias: '',
    notas: '',
  })

  useEffect(() => {
    if (cliente) {
      setFormData({
        documento_identidad: cliente.documento_identidad,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        fecha_nacimiento: cliente.fecha_nacimiento || '',
        estado_civil: cliente.estado_civil || '',
        ocupacion: cliente.ocupacion || '',
        referencias: cliente.referencias || '',
        notas: cliente.notas || '',
      })
    }
  }, [cliente])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (cliente) {
        // Actualizar
        const { error } = await supabase
          .from('clientes')
          .update(formData)
          .eq('id', cliente.id)

        if (error) throw error
        alert('Cliente actualizado exitosamente')
      } else {
        // Crear
        const { error } = await supabase
          .from('clientes')
          .insert([{
            ...formData,
            created_by: usuario?.id || null,
          }])

        if (error) throw error
        alert('Cliente creado exitosamente')
      }

      onClose()
    } catch (error: any) {
      console.error('Error guardando cliente:', error)
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto flex-1 p-8">

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Documento de Identidad *
              </label>
              <input
                type="text"
                required
                value={formData.documento_identidad}
                onChange={(e) =>
                  setFormData({ ...formData, documento_identidad: e.target.value })
                }
                className="input"
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
              <label className="block text-sm font-medium mb-1">Apellido *</label>
              <input
                type="text"
                required
                value={formData.apellido}
                onChange={(e) =>
                  setFormData({ ...formData, apellido: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_nacimiento: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Estado Civil</label>
              <select
                value={formData.estado_civil}
                onChange={(e) =>
                  setFormData({ ...formData, estado_civil: e.target.value })
                }
                className="input"
              >
                <option value="">Seleccionar...</option>
                <option value="soltero">Soltero</option>
                <option value="casado">Casado</option>
                <option value="divorciado">Divorciado</option>
                <option value="viudo">Viudo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ocupación</label>
              <input
                type="text"
                value={formData.ocupacion}
                onChange={(e) =>
                  setFormData({ ...formData, ocupacion: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <textarea
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              className="input"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Referencias</label>
            <textarea
              value={formData.referencias}
              onChange={(e) =>
                setFormData({ ...formData, referencias: e.target.value })
              }
              className="input"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <textarea
              value={formData.notas}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
              className="input"
              rows={3}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {cliente ? 'Actualizar Cliente' : 'Crear Cliente'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
