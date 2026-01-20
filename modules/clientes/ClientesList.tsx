'use client'

import { useEffect, useState } from 'react'
import { supabase, Cliente } from '@/lib/supabase'
import { ClienteForm } from './ClienteForm'
import { ClienteCard } from './ClienteCard'
import { Plus, Search } from 'lucide-react'
import { useUsuario } from '@/lib/useUsuario'

export function ClientesList() {
  const { usuario } = useUsuario()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)

  useEffect(() => {
    if (usuario) {
      loadClientes()
    }
  }, [usuario])

  const loadClientes = async () => {
    if (!usuario) return

    try {
      setLoading(true)
      let query = supabase
        .from('clientes')
        .select('*')

      // Si no es admin, filtrar solo sus clientes
      if (usuario.rol !== 'admin') {
        query = query.eq('created_by', usuario.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Error cargando clientes:', error)
      alert('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return

    try {
      // Verificar permisos
      const cliente = clientes.find((c) => c.id === id)
      if (!cliente) return

      if (usuario?.rol !== 'admin' && cliente.created_by !== usuario?.id) {
        alert('No tienes permisos para eliminar este cliente')
        return
      }

      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadClientes()
    } catch (error) {
      console.error('Error eliminando cliente:', error)
      alert('Error al eliminar cliente')
    }
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingCliente(null)
    loadClientes()
  }

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.documento_identidad.includes(searchTerm)
  )

  if (loading) {
    return <div className="text-center py-8">Cargando clientes...</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra la información de tus clientes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center space-x-2 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-12 h-14 text-base"
        />
      </div>

      {showForm && (
        <ClienteForm
          cliente={editingCliente}
          onClose={handleFormClose}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClientes.map((cliente) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredClientes.length === 0 && (
        <div className="card text-center py-16">
          <div className="bg-gray-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda' 
              : 'Comienza agregando tu primer cliente'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear Primer Cliente
            </button>
          )}
        </div>
      )}
    </div>
  )
}
