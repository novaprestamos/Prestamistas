'use client'

import { useEffect, useState } from 'react'
import { supabase, Prestamo, Cliente } from '@/lib/supabase'
import { PrestamoForm } from './PrestamoForm'
import { PrestamoCard } from './PrestamoCard'
import { Plus, Search, Filter, FileText } from 'lucide-react'
import { useUsuario } from '@/lib/useUsuario'
import { notifyError, notifySuccess } from '@/lib/notify'

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
      notifyError('Error al cargar clientes')
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
      notifyError('Error al cargar préstamos')
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
        notifyError('No tienes permisos para eliminar este préstamo')
        return
      }

      const { error } = await supabase
        .from('prestamos')
        .delete()
        .eq('id', id)

      if (error) throw error
      notifySuccess('Préstamo eliminado exitosamente')
      loadPrestamos()
    } catch (error) {
      console.error('Error eliminando préstamo:', error)
      notifyError('Error al eliminar préstamo')
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

  const totalPrestamos = prestamos.length
  const prestamosActivosCount = prestamos.filter((p) => p.estado === 'activo').length
  const prestamosVencidosCount = prestamos.filter((p) => p.estado === 'vencido').length
  const prestamosPagadosCount = prestamos.filter((p) => p.estado === 'pagado').length

  if (loading) {
    return <div className="text-center py-8">Cargando préstamos...</div>
  }

  return (
    <div className="page">
      <div className="hero-card">
        <h1 className="hero-title">Gestión de Préstamos</h1>
        <p className="hero-subtitle">Organiza y controla el estado de tus préstamos</p>
        <div className="page-actions">
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo Préstamo</span>
          </button>
        </div>
      </div>

      <div className="filter-panel">
        <div className="filter-group">
          <span className="filter-label">Buscar</span>
          <div className="filter-input">
            <Search className="filter-icon" />
            <input
              type="text"
              placeholder="Buscar por cliente o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input filter-input-field"
            />
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Estado</span>
          <div className="filter-input">
            <Filter className="filter-icon" />
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="input filter-input-field"
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
      </div>

      <div className="stat-grid">
        <div className="kpi-card">
          <div>
            <p className="stat-label">Total préstamos</p>
            <p className="stat-value">{totalPrestamos}</p>
          </div>
          <div className="kpi-icon">
            <FileText className="h-5 w-5" />
          </div>
        </div>
        <div className="kpi-card">
          <div>
            <p className="stat-label">Activos</p>
            <p className="stat-value">{prestamosActivosCount}</p>
          </div>
          <div className="kpi-icon">
            <FileText className="h-5 w-5" />
          </div>
        </div>
        <div className="kpi-card">
          <div>
            <p className="stat-label">Vencidos</p>
            <p className="stat-value">{prestamosVencidosCount}</p>
          </div>
          <div className="kpi-icon">
            <FileText className="h-5 w-5" />
          </div>
        </div>
        <div className="kpi-card">
          <div>
            <p className="stat-label">Pagados</p>
            <p className="stat-value">{prestamosPagadosCount}</p>
          </div>
          <div className="kpi-icon">
            <FileText className="h-5 w-5" />
          </div>
        </div>
      </div>

      {showForm && (
        <PrestamoForm
          prestamo={editingPrestamo}
          clientes={clientes}
          onClose={handleFormClose}
        />
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Listado de Préstamos</h2>
            <p className="panel-subtitle">Controla estados y movimientos</p>
          </div>
        </div>
        <div className="panel-body">
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
            <div className="empty-state">
              {searchTerm || filterEstado !== 'todos'
                ? 'No se encontraron préstamos'
                : 'No hay préstamos registrados'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
