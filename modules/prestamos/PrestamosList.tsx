'use client'

import { useEffect, useState } from 'react'
import { supabase, Prestamo, Cliente } from '@/lib/supabase'
import { PrestamoForm } from './PrestamoForm'
import { PrestamoCard } from './PrestamoCard'
import { Plus, Search, Filter } from 'lucide-react'
import { useUsuario } from '@/lib/useUsuario'

export function PrestamosList() {
  const { usuario } = useUsuario()
  const [prestamos, setPrestamos] = useState<(Prestamo & { cliente?: Cliente })[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('todos')
  const [editingPrestamo, setEditingPrestamo] = useState<Prestamo | null>(null)

  useEffect(() => {
    if (usuario) {
      loadClientes()
      loadPrestamos()
    }
  }, [usuario])

  const loadClientes = async () => {
    if (!usuario) return

    try {
      let query = supabase
        .from('clientes')
        .select('*')
        .eq('activo', true)

      // Si no es admin, solo sus clientes
      if (usuario.rol !== 'admin') {
        query = query.eq('created_by', usuario.id)
      }

      const { data, error } = await query.order('nombre')

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Error cargando clientes:', error)
    }
  }

  const loadPrestamos = async () => {
    if (!usuario) return

    try {
      setLoading(true)
      let query = supabase
        .from('prestamos')
        .select(`
          *,
          cliente:clientes(*)
        `)

      // Si no es admin, solo sus préstamos
      if (usuario.rol !== 'admin') {
        query = query.eq('created_by', usuario.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setPrestamos(data || [])
    } catch (error) {
      console.error('Error cargando préstamos:', error)
      alert('Error al cargar préstamos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este préstamo?')) return

    try {
      // Verificar permisos
      const prestamo = prestamos.find((p) => p.id === id)
      if (!prestamo) return

      if (usuario?.rol !== 'admin' && prestamo.created_by !== usuario?.id) {
        alert('No tienes permisos para eliminar este préstamo')
        return
      }

      const { error } = await supabase
        .from('prestamos')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadPrestamos()
    } catch (error) {
      console.error('Error eliminando préstamo:', error)
      alert('Error al eliminar préstamo')
    }
  }

  const handleEdit = (prestamo: Prestamo) => {
    setEditingPrestamo(prestamo)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPrestamo(null)
    loadPrestamos()
  }

  const filteredPrestamos = prestamos.filter((prestamo) => {
    const matchesSearch =
      prestamo.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prestamo.cliente?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prestamo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEstado = filterEstado === 'todos' || prestamo.estado === filterEstado
    
    return matchesSearch && matchesEstado
  })

  if (loading) {
    return <div className="text-center py-8">Cargando préstamos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Préstamos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Préstamo</span>
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por cliente o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="input"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="pagado">Pagados</option>
            <option value="vencido">Vencidos</option>
            <option value="moroso">Morosos</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {showForm && (
        <PrestamoForm
          prestamo={editingPrestamo}
          clientes={clientes}
          onClose={handleFormClose}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrestamos.map((prestamo) => (
          <PrestamoCard
            key={prestamo.id}
            prestamo={prestamo}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredPrestamos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchTerm || filterEstado !== 'todos'
            ? 'No se encontraron préstamos'
            : 'No hay préstamos registrados'}
        </div>
      )}
    </div>
  )
}
