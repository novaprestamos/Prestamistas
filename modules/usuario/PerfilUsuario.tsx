'use client'

import { useEffect, useRef, useState } from 'react'
import { useUsuario } from '@/lib/useUsuario'
import { supabase } from '@/lib/supabase'
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  Calendar,
  Edit,
  Save,
  X,
  UserCircle,
  FileText,
  Phone,
  Flag,
  Map,
  MapPin,
  Home,
  Users,
  Lock,
} from 'lucide-react'
import { notifyError, notifySuccess } from '@/lib/notify'

export function PerfilUsuario() {
  const { usuario, loading, updateUsuario } = useUsuario()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rol: '' as 'admin' | 'prestamista' | 'operador',
    avatar_url: '',
    documento_identidad: '',
    celular: '',
    pais: '',
    region: '',
    ciudad: '',
    direccion: '',
    sexo: '' as 'masculino' | 'femenino' | 'otro' | '',
    fecha_nacimiento: '',
    password: '',
    confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        apellido: usuario.apellido || '',
        email: usuario.email,
        rol: usuario.rol,
        avatar_url: usuario.avatar_url || '',
        documento_identidad: usuario.documento_identidad || '',
        celular: usuario.celular || '',
        pais: usuario.pais || '',
        region: usuario.region || '',
        ciudad: usuario.ciudad || '',
        direccion: usuario.direccion || '',
        sexo: usuario.sexo || '',
        fecha_nacimiento: usuario.fecha_nacimiento || '',
        password: '',
        confirmPassword: '',
      })
      setAvatarPreview(usuario.avatar_url || null)
      setAvatarFile(null)
      setRemoveAvatar(false)
    }
  }, [usuario])

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  useEffect(() => {
    if (!cameraOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      return
    }

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          notifyError('Tu navegador no soporta acceso a cámara.')
          setCameraOpen(false)
          return
        }
        if (!window.isSecureContext) {
          notifyError('La cámara requiere HTTPS o localhost.')
          setCameraOpen(false)
          return
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error: any) {
        notifyError('No se pudo acceder a la cámara. Verifica permisos.')
        setCameraOpen(false)
      }
    }

    startCamera()
  }, [cameraOpen])

  const handleSave = async () => {
    if (!usuario) return

    try {
      setSaving(true)
      if (formData.password && formData.password !== formData.confirmPassword) {
        notifyError('Las contraseñas no coinciden')
        return
      }

      if (formData.email !== usuario.email || formData.password) {
        const { error: authError } = await supabase.auth.updateUser({
          email: formData.email !== usuario.email ? formData.email : undefined,
          password: formData.password || undefined,
        })

        if (authError) throw authError
      }

      let avatarUrl = removeAvatar ? '' : formData.avatar_url

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `usuarios/${usuario.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true,
            contentType: avatarFile.type,
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
        avatarUrl = data.publicUrl
      }

      await updateUsuario({
        nombre: formData.nombre,
        apellido: formData.apellido || undefined,
        email: formData.email,
        avatar_url: avatarUrl || undefined,
        documento_identidad: formData.documento_identidad || undefined,
        celular: formData.celular || undefined,
        pais: formData.pais || undefined,
        region: formData.region || undefined,
        ciudad: formData.ciudad || undefined,
        direccion: formData.direccion || undefined,
        sexo: formData.sexo || undefined,
        fecha_nacimiento: formData.fecha_nacimiento || undefined,
      })

      setEditing(false)
      setAvatarFile(null)
      setAvatarPreview(avatarUrl || null)
      setRemoveAvatar(false)
      notifySuccess('Perfil actualizado exitosamente')
    } catch (error: any) {
      notifyError(error?.message ? `Error: ${error.message}` : 'Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        apellido: usuario.apellido || '',
        email: usuario.email,
        rol: usuario.rol,
        avatar_url: usuario.avatar_url || '',
        documento_identidad: usuario.documento_identidad || '',
        celular: usuario.celular || '',
        pais: usuario.pais || '',
        region: usuario.region || '',
        ciudad: usuario.ciudad || '',
        direccion: usuario.direccion || '',
        sexo: usuario.sexo || '',
        fecha_nacimiento: usuario.fecha_nacimiento || '',
        password: '',
        confirmPassword: '',
      })
      setAvatarPreview(usuario.avatar_url || null)
      setAvatarFile(null)
      setRemoveAvatar(false)
    }
    setEditing(false)
  }

  const getRolLabel = (rol: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      prestamista: 'Prestamista',
      operador: 'Operador',
    }
    return labels[rol] || rol
  }

  const getRolColor = (rol: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      prestamista: 'bg-blue-100 text-blue-800',
      operador: 'bg-green-100 text-green-800',
    }
    return colors[rol] || 'bg-gray-100 text-gray-800'
  }

  const formatValue = (value?: string) => {
    if (!value || !value.trim()) return 'No registrada'
    return value
  }

  const formatDate = (value?: string) => {
    if (!value) return 'No registrada'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'No registrada'
    return date.toLocaleDateString('es-ES')
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando perfil...</p>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Usuario no encontrado</h2>
        <p className="text-gray-600">
          No se pudo cargar la información del usuario. Por favor, inicia sesión.
        </p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="profile-hero">
        <div className="profile-hero-glow" />
        <div className="profile-hero-content">
          <div className="profile-identity">
            <div
              className={`profile-avatar-lg ${formData.avatar_url || avatarPreview ? 'has-image' : ''}`}
            >
              {formData.avatar_url || avatarPreview ? (
                <img src={avatarPreview || formData.avatar_url} alt="Foto de perfil" />
              ) : (
                <User className="h-7 w-7" />
              )}
            </div>
            <div>
              <div className="profile-overline">Panel personal</div>
              <h1 className="profile-title">
                {usuario.nombre} {usuario.apellido}
              </h1>
              <p className="profile-meta">{usuario.email}</p>
              <div className="profile-chips">
                <span className="profile-chip">{getRolLabel(usuario.rol)}</span>
                <span className={`profile-chip ${usuario.activo ? 'profile-chip-success' : 'profile-chip-danger'}`}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
          <div className="profile-hero-actions">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Edit className="h-5 w-5" />
                <span>Editar Perfil</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{saving ? 'Guardando...' : 'Guardar'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="customer-kpi-grid profile-kpi-grid">
        <div className="customer-kpi-card">
          <div>
            <div className="customer-kpi-label">Estado de cuenta</div>
            <div className="customer-kpi-value">{usuario.activo ? 'Activo' : 'Inactivo'}</div>
          </div>
          <div
            className={`customer-kpi-icon ${
              usuario.activo ? 'customer-kpi-icon-active' : 'customer-kpi-icon-inactive'
            }`}
          >
            {usuario.activo ? <ShieldCheck className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
          </div>
        </div>
        <div className="customer-kpi-card">
          <div>
            <div className="customer-kpi-label">Privacidad</div>
            <div className="customer-kpi-value">Datos sensibles ocultos</div>
          </div>
          <div className="customer-kpi-icon">
            <Lock className="h-5 w-5" />
          </div>
        </div>
        <div className="customer-kpi-card">
          <div>
            <div className="customer-kpi-label">Rol asignado</div>
            <div className="customer-kpi-value">{getRolLabel(usuario.rol)}</div>
          </div>
          <div className="customer-kpi-icon">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-panel">
          <div className="profile-panel-header">
            <div>
              <h3>Información personal</h3>
              <p>Datos principales del perfil</p>
            </div>
            <span className="profile-panel-chip">Perfil</span>
          </div>
          <div className="profile-panel-body">
            <div className="profile-item">
              <span className="profile-item-label">Nombre</span>
              <span className="profile-item-value">{formatValue(usuario.nombre)}</span>
            </div>
            <div className="profile-item">
              <span className="profile-item-label">Apellido</span>
              <span className="profile-item-value">{formatValue(usuario.apellido)}</span>
            </div>
            <div className="profile-item">
              <span className="profile-item-label">Correo electrónico</span>
              <span className="profile-item-value">{formatValue(usuario.email)}</span>
            </div>
            <div className="profile-item">
              <span className="profile-item-label">Documento</span>
              <span className="profile-item-value">{formatValue(usuario.documento_identidad)}</span>
            </div>
            <div className="profile-item">
              <span className="profile-item-label">Celular</span>
              <span className="profile-item-value">{formatValue(usuario.celular)}</span>
            </div>
            <div className="profile-item">
              <span className="profile-item-label">Sexo</span>
              <span className="profile-item-value">{formatValue(usuario.sexo)}</span>
            </div>
            <div className="profile-item">
              <span className="profile-item-label">Fecha de nacimiento</span>
              <span className="profile-item-value">{formatDate(usuario.fecha_nacimiento)}</span>
            </div>
          </div>
        </div>

        {editing && (
          <div className="panel profile-surface">
            <div className="panel-header">
              <h3 className="panel-title">Editar Información</h3>
            </div>
            <div className="panel-body space-y-4">
              <div className="avatar-uploader">
                <div className="avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Vista previa" />
                  ) : (
                    <User className="h-6 w-6 text-indigo-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Foto de perfil</p>
                  <p className="text-xs text-slate-500">Sube una imagen o usa la cámara.</p>
                  <div className="avatar-actions mt-3">
                    <label className="btn btn-secondary btn-sm cursor-pointer">
                      Subir imagen
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const preview = URL.createObjectURL(file)
                          setAvatarPreview(preview)
                          setAvatarFile(file)
                          setRemoveAvatar(false)
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setCameraOpen((prev) => !prev)}
                    >
                      {cameraOpen ? 'Cerrar cámara' : 'Usar cámara'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setAvatarPreview(null)
                        setAvatarFile(null)
                        setRemoveAvatar(true)
                      }}
                    >
                      Eliminar foto
                    </button>
                  </div>
                </div>
              </div>

              {cameraOpen && (
                <div className="panel profile-surface">
                  <div className="panel-header">
                    <h4 className="panel-title">Captura desde cámara</h4>
                  </div>
                  <div className="panel-body space-y-4">
                    <div className="rounded-2xl overflow-hidden border border-white/60 bg-slate-900/10">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        const video = videoRef.current
                        if (!video) return
                        const canvas = document.createElement('canvas')
                        canvas.width = video.videoWidth || 640
                        canvas.height = video.videoHeight || 480
                        const ctx = canvas.getContext('2d')
                        if (!ctx) return
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                        canvas.toBlob((blob) => {
                          if (!blob) return
                          const file = new File([blob], `perfil-${Date.now()}.png`, { type: 'image/png' })
                          const preview = URL.createObjectURL(file)
                          setAvatarPreview(preview)
                          setAvatarFile(file)
                          setRemoveAvatar(false)
                          setCameraOpen(false)
                        }, 'image/png')
                      }}
                    >
                      Capturar foto
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <div className="field-wrap">
                    <UserCircle className="field-icon" />
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="input field-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellido</label>
                  <div className="field-wrap">
                    <UserCircle className="field-icon" />
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      className="input field-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <div className="field-wrap">
                    <Mail className="field-icon" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input field-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Documento</label>
                  <div className="field-wrap">
                    <FileText className="field-icon" />
                    <input
                      type="text"
                      value={formData.documento_identidad}
                      onChange={(e) =>
                        setFormData({ ...formData, documento_identidad: e.target.value })
                      }
                      className="input field-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Celular</label>
                  <div className="field-wrap">
                    <Phone className="field-icon" />
                    <input
                      type="tel"
                      value={formData.celular}
                      onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                      className="input field-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">País</label>
                  <div className="field-wrap">
                    <Flag className="field-icon" />
                    <input
                      type="text"
                      value={formData.pais}
                      onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                      className="input field-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Región</label>
                  <div className="field-wrap">
                    <Map className="field-icon" />
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="input field-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ciudad</label>
                  <div className="field-wrap">
                    <MapPin className="field-icon" />
                    <input
                      type="text"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                      className="input field-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dirección</label>
                  <div className="field-wrap">
                    <Home className="field-icon" />
                    <input
                      type="text"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      className="input field-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sexo</label>
                  <div className="field-wrap">
                    <Users className="field-icon" />
                    <select
                      value={formData.sexo}
                      onChange={(e) => setFormData({ ...formData, sexo: e.target.value as any })}
                      className="input field-input"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de nacimiento</label>
                  <div className="field-wrap">
                    <Calendar className="field-icon" />
                    <input
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha_nacimiento: e.target.value })
                      }
                      className="input field-input"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
                  <div className="field-wrap">
                    <Lock className="field-icon" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input field-input"
                      placeholder="Opcional"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirmar contraseña</label>
                  <div className="field-wrap">
                    <Lock className="field-icon" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="input field-input"
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> El rol y la fecha de creación no se pueden modificar desde aquí.
                </p>
              </div>
            </div>
          </div>
        )}

        {!editing && (
          <div className="profile-panel">
            <div className="profile-panel-header">
              <div>
                <h3>Ubicación</h3>
                <p>Datos de residencia</p>
              </div>
              <span className="profile-panel-chip">Contacto</span>
            </div>
            <div className="profile-panel-body">
              <div className="profile-item">
                <span className="profile-item-label">País</span>
                <span className="profile-item-value">{formatValue(usuario.pais)}</span>
              </div>
              <div className="profile-item">
                <span className="profile-item-label">Región / Departamento</span>
                <span className="profile-item-value">{formatValue(usuario.region)}</span>
              </div>
              <div className="profile-item">
                <span className="profile-item-label">Ciudad</span>
                <span className="profile-item-value">{formatValue(usuario.ciudad)}</span>
              </div>
              <div className="profile-item">
                <span className="profile-item-label">Dirección</span>
                <span className="profile-item-value">{formatValue(usuario.direccion)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!editing && (
        <div className="profile-panel profile-panel-wide">
          <div className="profile-panel-header">
            <div>
              <h3>Información de cuenta</h3>
              <p>Estado y configuración principal</p>
            </div>
            <span className="profile-panel-chip">Cuenta</span>
          </div>
          <div className="profile-panel-body profile-panel-columns">
            <div className="profile-item">
              <span className="profile-item-label">Rol</span>
              <span className="profile-item-value">{getRolLabel(usuario.rol)}</span>
            </div>
            <div className="profile-item">
              <span className="profile-item-label">Estado</span>
              <span className="profile-item-value">{usuario.activo ? 'Activo' : 'Inactivo'}</span>
            </div>
            <div className="profile-item">
              <span className="profile-item-label">Fecha de registro</span>
              <span className="profile-item-value">{formatDate(usuario.created_at)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
