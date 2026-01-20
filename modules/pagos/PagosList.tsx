'use client'

import { useEffect, useState } from 'react'
import { supabase, Pago, Prestamo, Cliente } from '@/lib/supabase'
import { PagoForm } from './PagoForm'
import { PagoCard } from './PagoCard'
import { Plus, Search, Filter, Calendar } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useUsuario } from '@/lib/useUsuario'

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
      alert('Error al cargar pagos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este pago?')) return

    try {
      const { error } = await supabase
        .from('pagos')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadPagos()
      loadPrestamos()
    } catch (error) {
      console.error('Error eliminando pago:', error)
      alert('Error al eliminar pago')
    }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Registrar Pago</span>
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por cliente o número de recibo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <input
            type="month"
            value={filterMes}
            onChange={(e) => setFilterMes(e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="bg-primary-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium text-lg">Total del Mes:</span>
          <span className="text-2xl font-bold text-primary-700">
            ${totalPagos.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {pagos.length} pago(s) registrado(s)
        </p>
      </div>

      {showForm && (
        <PagoForm
          pago={editingPago}
          prestamos={prestamos}
          onClose={handleFormClose}
        />
      )}

      <div className="space-y-4">
        {filteredPagos.map((pago) => (
          <PagoCard
            key={pago.id}
            pago={pago}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredPagos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchTerm
            ? 'No se encontraron pagos'
            : 'No hay pagos registrados para este mes'}
        </div>
      )}
    </div>
  )
}
