'use client'

import { useEffect, useState } from 'react'
import { supabase, Cliente } from '@/lib/supabase'
import { ClienteForm } from './ClienteForm'
import { ClienteCard } from './ClienteCard'
import { Plus, Search, Users, UserCheck, UserX, Filter } from 'lucide-react'
import { useUsuario } from '@/lib/useUsuario'
import { notifyError, notifySuccess } from '@/lib/notify'

export function ClientesList() {
  const { usuario } = useUsuario()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<
    'todos' | 'activo' | 'inactivo' | 'mora' | 'aldia' | 'credito_activo'
  >('todos')
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [deudas, setDeudas] = useState<Record<string, number>>({})
  const [creditos, setCreditos] = useState<Record<string, { mora: boolean; activo: boolean; alDia: boolean }>>({})

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
      const clientesData = data || []
      setClientes(clientesData)
      await loadDeudas(clientesData)
    } catch (error) {
      console.error('Error cargando clientes:', error)
      notifyError('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const loadDeudas = async (clientesData: Cliente[]) => {
    if (!usuario) return
    if (clientesData.length === 0) {
      setDeudas({})
      setCreditos({})
      return
    }

    try {
      const clienteIds = clientesData.map((cliente) => cliente.id)
      let query = supabase
        .from('prestamos')
        .select('cliente_id, monto_pendiente, estado')
        .in('cliente_id', clienteIds)

      if (usuario.rol !== 'admin') {
        query = query.eq('created_by', usuario.id)
      }

      const { data, error } = await query
      if (error) throw error

      const resumen = (data || []).reduce<Record<string, number>>((acc, prestamo) => {
        const tieneDeuda =
          prestamo.monto_pendiente > 0 &&
          prestamo.estado !== 'pagado' &&
          prestamo.estado !== 'cancelado'

        if (tieneDeuda) {
          acc[prestamo.cliente_id] =
            (acc[prestamo.cliente_id] || 0) + prestamo.monto_pendiente
        }
        return acc
      }, {})

      const estados = (data || []).reduce<Record<string, { mora: boolean; activo: boolean; alDia: boolean }>>(
        (acc, prestamo) => {
          const current = acc[prestamo.cliente_id] || { mora: false, activo: false, alDia: false }
          const esMora = prestamo.estado === 'moroso' || prestamo.estado === 'vencido'
          const esActivo = prestamo.estado === 'activo'
          return {
            mora: current.mora || esMora,
            activo: current.activo || esActivo,
            alDia: current.alDia || (esActivo && !esMora),
          }
        },
        {}
      )

      setDeudas(resumen)
      setCreditos(estados)
    } catch (error) {
      console.error('Error cargando deudas de clientes:', error)
      setDeudas({})
      setCreditos({})
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return

    try {
      // Verificar permisos
      const cliente = clientes.find((c) => c.id === id)
      if (!cliente) return

      if (usuario?.rol !== 'admin' && cliente.created_by !== usuario?.id) {
        notifyError('No tienes permisos para eliminar este cliente')
        return
      }

      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)

      if (error) throw error
      notifySuccess('Cliente eliminado exitosamente')
      loadClientes()
    } catch (error) {
      console.error('Error eliminando cliente:', error)
      notifyError('Error al eliminar cliente')
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

  const filteredClientes = clientes.filter((cliente) => {
    const matchesSearch =
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cliente.documento_identidad || '').includes(searchTerm)

    const estadoCredito = creditos[cliente.id] || { mora: false, activo: false, alDia: false }
    const matchesEstado =
      filterEstado === 'todos' ||
      (filterEstado === 'activo' && cliente.activo) ||
      (filterEstado === 'inactivo' && !cliente.activo) ||
      (filterEstado === 'mora' && estadoCredito.mora) ||
      (filterEstado === 'aldia' && estadoCredito.alDia) ||
      (filterEstado === 'credito_activo' && estadoCredito.activo)

    return matchesSearch && matchesEstado
  })

  const totalClientes = clientes.length
  const clientesActivos = clientes.filter((c) => c.activo).length
  const clientesInactivos = totalClientes - clientesActivos

  if (loading) {
    return <div className="text-center py-8">Cargando clientes...</div>
  }

  return (
    <div className="page animate-fade-in">
      <div className="hero-card">
        <h1 className="hero-title">Gestión de Clientes</h1>
        <p className="hero-subtitle">Administra la información de tus clientes</p>
        <div className="page-actions">
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center space-x-2 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      <div className="customer-kpi-grid">
        <div className="customer-kpi-card">
          <div>
            <p className="customer-kpi-label">Total clientes</p>
            <p className="customer-kpi-value">{totalClientes}</p>
          </div>
          <div className="customer-kpi-icon">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="customer-kpi-card">
          <div>
            <p className="customer-kpi-label">Activos</p>
            <p className="customer-kpi-value">{clientesActivos}</p>
          </div>
          <div className="customer-kpi-icon customer-kpi-icon-active">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="customer-kpi-card">
          <div>
            <p className="customer-kpi-label">Inactivos</p>
            <p className="customer-kpi-value">{clientesInactivos}</p>
          </div>
          <div className="customer-kpi-icon customer-kpi-icon-inactive">
            <UserX className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="filter-panel">
        <div className="filter-group">
          <span className="filter-label">Buscar</span>
          <div className="filter-input">
            <Search className="filter-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o documento..."
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
              onChange={(e) =>
                setFilterEstado(
                  e.target.value as 'todos' | 'activo' | 'inactivo' | 'mora' | 'aldia' | 'credito_activo'
                )
              }
              className="input filter-input-field"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="mora">Créditos en mora</option>
              <option value="aldia">Créditos al día</option>
              <option value="credito_activo">Crédito activo</option>
            </select>
          </div>
        </div>
      </div>

      {showForm && (
        <ClienteForm
          cliente={editingCliente}
          onClose={handleFormClose}
        />
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Listado de Clientes</h2>
            <p className="panel-subtitle">Visualiza y gestiona tu cartera</p>
          </div>
        </div>
        <div className="panel-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClientes.map((cliente) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                deudaPendiente={deudas[cliente.id] || 0}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {filteredClientes.length === 0 && (
            <div className="empty-state">
              <div className="bg-gray-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer cliente'}
              </p>
              {!searchTerm && (
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Primer Cliente
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
