'use client'

import { useEffect, useState } from 'react'
import { supabase, Usuario } from '@/lib/supabase'
import { UsuarioForm } from './UsuarioForm'
import { UsuarioCard } from './UsuarioCard'
import { Plus, Search, Shield, User } from 'lucide-react'
import { useUsuario } from '@/lib/useUsuario'
import { notifyError, notifySuccess } from '@/lib/notify'

export function UsuariosList() {
  const { usuario: currentUser } = useUsuario()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    // Solo admin puede ver esta página
    if (currentUser && currentUser.rol !== 'admin') {
      notifyError('No tienes permisos para acceder a esta sección')
      window.location.href = '/'
      return
    }
    loadUsuarios()
  }, [currentUser])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      notifyError('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id)

      if (error) throw error
      notifySuccess('Usuario eliminado exitosamente')
      loadUsuarios()
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      notifyError('Error al eliminar usuario')
    }
  }

  const handleApprove = async (id: string) => {
    if (!confirm('¿Aprobar acceso para este usuario?')) return

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: true })
        .eq('id', id)

      if (error) throw error
      notifySuccess('Usuario aprobado exitosamente')
      loadUsuarios()
    } catch (error) {
      console.error('Error aprobando usuario:', error)
      notifyError('Error al aprobar usuario')
    }
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingUsuario(null)
    loadUsuarios()
  }

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalUsuarios = usuarios.length
  const usuariosActivos = usuarios.filter((u) => u.activo).length
  const usuariosPendientes = totalUsuarios - usuariosActivos

  if (currentUser?.rol !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Acceso Denegado</h2>
        <p className="text-gray-600">Solo los administradores pueden acceder a esta sección.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Cargando usuarios...</div>
  }

  return (
    <div className="page">
      <div className="hero-card">
        <h1 className="hero-title">Gestión de Usuarios</h1>
        <p className="hero-subtitle">Administra roles y aprobaciones</p>
        <div className="page-actions">
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo Usuario</span>
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
              placeholder="Buscar por nombre, apellido o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input filter-input-field"
            />
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="kpi-card">
          <div>
            <p className="stat-label">Total usuarios</p>
            <p className="stat-value">{totalUsuarios}</p>
          </div>
          <div className="kpi-icon">
            <User className="h-5 w-5" />
          </div>
        </div>
        <div className="kpi-card">
          <div>
            <p className="stat-label">Activos</p>
            <p className="stat-value">{usuariosActivos}</p>
          </div>
          <div className="kpi-icon">
            <User className="h-5 w-5" />
          </div>
        </div>
        <div className="kpi-card">
          <div>
            <p className="stat-label">Pendientes</p>
            <p className="stat-value">{usuariosPendientes}</p>
          </div>
          <div className="kpi-icon">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>

      {showForm && (
        <UsuarioForm
          usuario={editingUsuario}
          onClose={handleFormClose}
        />
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Listado de Usuarios</h2>
            <p className="panel-subtitle">Accesos y aprobaciones</p>
          </div>
        </div>
        <div className="panel-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsuarios.map((usuario) => (
              <UsuarioCard
                key={usuario.id}
                usuario={usuario}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onApprove={handleApprove}
                currentUserId={currentUser?.id}
              />
            ))}
          </div>

          {filteredUsuarios.length === 0 && (
            <div className="empty-state">
              {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
