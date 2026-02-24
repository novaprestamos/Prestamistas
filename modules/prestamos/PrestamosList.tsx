'use client'

import { useEffect, useState } from 'react'
import { Prestamo, Cliente } from '@/lib/supabase'
import { PrestamoForm } from './PrestamoForm'
import { PrestamoCard } from './PrestamoCard'
import { Plus, Search, Filter, FileText } from 'lucide-react'
import { useUsuario } from '@/lib/useUsuario'
import { notifySuccess } from '@/lib/notify'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { fetchClientesActivosParaPrestamos, fetchPrestamosForUsuario, deletePrestamoById } from '@/lib/prestamosService'
import { handleSupabaseError } from '@/lib/errors'

export function PrestamosList() {
  const { usuario } = useUsuario()
  const [prestamos, setPrestamos] = useState<(Prestamo & { cliente?: Cliente })[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('todos')
  const [editingPrestamo, setEditingPrestamo] = useState<Prestamo | null>(null)
  const [prestamoAEliminar, setPrestamoAEliminar] = useState<Prestamo | null>(null)

  useEffect(() => {
    if (usuario) {
      loadClientes()
      loadPrestamos()
    }
  }, [usuario])

  const loadClientes = async () => {
    if (!usuario) return

    try {
      const data = await fetchClientesActivosParaPrestamos(usuario)
      setClientes(data)
    } catch (error) {
      handleSupabaseError('cargar clientes para préstamos', error)
    }
  }

  const loadPrestamos = async () => {
    if (!usuario) return

    try {
      setLoading(true)
      const data = await fetchPrestamosForUsuario(usuario)
      setPrestamos(data)
    } catch (error) {
      handleSupabaseError('cargar préstamos', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      // Verificar permisos
      const prestamo = prestamos.find((p) => p.id === id)
      if (!prestamo) return

      if (usuario?.rol !== 'admin' && prestamo.created_by !== usuario?.id) {
        notifyError('No tienes permisos para eliminar este préstamo')
        return
      }

      await deletePrestamoById(id)
      notifySuccess('Préstamo eliminado exitosamente')
      loadPrestamos()
    } catch (error) {
      handleSupabaseError('eliminar préstamo', error)
    }
  }

  const solicitarEliminar = (prestamo: Prestamo) => {
    setPrestamoAEliminar(prestamo)
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
    <div className="page animate-fade-in">
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
                onDelete={() => solicitarEliminar(prestamo)}
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
      <ConfirmDialog
        open={!!prestamoAEliminar}
        title="Eliminar préstamo"
        description={
          prestamoAEliminar
            ? `¿Está seguro de eliminar el préstamo ${prestamoAEliminar.id.substring(0, 8)}...? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (prestamoAEliminar) {
            handleDelete(prestamoAEliminar.id)
          }
          setPrestamoAEliminar(null)
        }}
        onCancel={() => setPrestamoAEliminar(null)}
      />
    </div>
  )
}
