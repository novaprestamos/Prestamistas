'use client'

import { useEffect, useState } from 'react'
import { supabase, Pago, Prestamo, Cliente } from '@/lib/supabase'
import { PagoForm } from './PagoForm'
import { PagoCard } from './PagoCard'
import { Plus, Search, Filter, Calendar } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useUsuario } from '@/lib/useUsuario'
import { notifyError, notifySuccess } from '@/lib/notify'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatCurrency } from '@/lib/format'

export function PagosList() {
  const { usuario } = useUsuario()
  const [pagos, setPagos] = useState<
    (Pago & { prestamo?: Prestamo & { cliente?: Cliente } })[]
  >([])
  const [prestamos, setPrestamos] = useState<Prestamo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMes, setFilterMes] = useState(format(new Date(), 'yyyy-MM'))
  const [editingPago, setEditingPago] = useState<Pago | null>(null)
  const [pagoAEliminar, setPagoAEliminar] = useState<Pago | null>(null)

  useEffect(() => {
    if (usuario) {
      loadPrestamos()
      loadPagos()
    }
  }, [filterMes, usuario])

  const loadPrestamos = async () => {
    if (!usuario) return

    try {
      let query = supabase
        .from('prestamos')
        .select('*')
        .in('estado', ['activo', 'vencido', 'moroso'])

      // Si no es admin, solo sus préstamos
      if (usuario.rol !== 'admin') {
        query = query.eq('created_by', usuario.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setPrestamos(data || [])
    } catch (error) {
      console.error('Error cargando préstamos:', error)
    }
  }

  const loadPagos = async () => {
    if (!usuario) return

    try {
      setLoading(true)
      const inicioMes = startOfMonth(new Date(filterMes + '-01'))
      const finMes = endOfMonth(new Date(filterMes + '-01'))

      let query = supabase
        .from('pagos')
        .select(`
          *,
          prestamo:prestamos(
            *,
            cliente:clientes(*)
          )
        `)
        .gte('fecha_pago', format(inicioMes, 'yyyy-MM-dd'))
        .lte('fecha_pago', format(finMes, 'yyyy-MM-dd'))

      // Filtrar pagos de préstamos del usuario
      if (usuario.rol !== 'admin') {
        // Primero obtener IDs de préstamos del usuario
        const { data: userPrestamos } = await supabase
          .from('prestamos')
          .select('id')
          .eq('created_by', usuario.id)

        const prestamoIds = userPrestamos?.map((p) => p.id) || []
        
        if (prestamoIds.length > 0) {
          query = query.in('prestamo_id', prestamoIds)
        } else {
          // Si no tiene préstamos, no mostrar pagos
          setPagos([])
          setLoading(false)
          return
        }
      }

      const { data, error } = await query.order('fecha_pago', { ascending: false })

      if (error) throw error
      setPagos(data || [])
    } catch (error) {
      console.error('Error cargando pagos:', error)
      notifyError('Error al cargar pagos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pagos')
        .delete()
        .eq('id', id)

      if (error) throw error
      notifySuccess('Pago eliminado exitosamente')
      loadPagos()
      loadPrestamos()
    } catch (error) {
      console.error('Error eliminando pago:', error)
      notifyError('Error al eliminar pago')
    }
  }

  const solicitarEliminar = (pago: Pago) => {
    setPagoAEliminar(pago)
  }

  const handleEdit = (pago: Pago) => {
    setEditingPago(pago)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPago(null)
    loadPagos()
    loadPrestamos()
  }

  const totalPagos = pagos.reduce((sum, pago) => sum + pago.monto, 0)
  const pagosCount = pagos.length

  const filteredPagos = pagos.filter(
    (pago) =>
      pago.prestamo?.cliente?.nombre
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      pago.prestamo?.cliente?.apellido
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      pago.numero_recibo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-8">Cargando pagos...</div>
  }

  return (
    <div className="page animate-fade-in">
      <div className="hero-card">
        <h1 className="hero-title">Gestión de Pagos</h1>
        <p className="hero-subtitle">Registra pagos y controla la recuperación mensual</p>
        <div className="page-actions">
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Registrar Pago</span>
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
              placeholder="Buscar por cliente o número de recibo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input filter-input-field"
            />
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Mes</span>
          <div className="filter-input">
            <Calendar className="filter-icon" />
            <input
              type="month"
              value={filterMes}
              onChange={(e) => setFilterMes(e.target.value)}
              className="input filter-input-field"
            />
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="kpi-card">
          <div>
            <p className="stat-label">Total del Mes</p>
            <p className="stat-value">${formatCurrency(totalPagos)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {pagosCount} pago(s) registrado(s)
            </p>
          </div>
          <div className="kpi-icon">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
        <div className="kpi-card">
          <div>
            <p className="stat-label">Promedio por pago</p>
            <p className="stat-value">
              ${pagosCount > 0 ? formatCurrency(totalPagos / pagosCount) : '0,00'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Basado en pagos del mes</p>
          </div>
          <div className="kpi-icon">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      {showForm && (
        <PagoForm
          pago={editingPago}
          prestamos={prestamos}
          onClose={handleFormClose}
        />
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Historial de Pagos</h2>
            <p className="panel-subtitle">Detalle de pagos registrados</p>
          </div>
        </div>
        <div className="panel-body space-y-4">
          {filteredPagos.map((pago) => (
            <PagoCard
              key={pago.id}
              pago={pago}
              onEdit={handleEdit}
              onDelete={() => solicitarEliminar(pago)}
            />
          ))}

          {filteredPagos.length === 0 && (
            <div className="empty-state">
              {searchTerm ? 'No se encontraron pagos' : 'No hay pagos registrados para este mes'}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={!!pagoAEliminar}
        title="Eliminar pago"
        description={
          pagoAEliminar
            ? `¿Está seguro de eliminar el pago con recibo ${pagoAEliminar.numero_recibo || pagoAEliminar.id.substring(0, 8)}?`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (pagoAEliminar) {
            handleDelete(pagoAEliminar.id)
          }
          setPagoAEliminar(null)
        }}
        onCancel={() => setPagoAEliminar(null)}
      />
    </div>
  )
}
