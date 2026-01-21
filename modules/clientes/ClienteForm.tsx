'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, Cliente } from '@/lib/supabase'
import { X, FileText, User, Phone, Mail, Home, Calendar, Users, Briefcase, StickyNote } from 'lucide-react'
import { useUsuario } from '@/lib/useUsuario'
import { notifyError, notifySuccess } from '@/lib/notify'

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
    avatar_url: '',
    telefono: '',
    email: '',
    direccion: '',
    fecha_nacimiento: '',
    estado_civil: '',
    ocupacion: '',
    referencias: '',
    notas: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (cliente) {
      setFormData({
        documento_identidad: cliente.documento_identidad,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        avatar_url: cliente.avatar_url || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        fecha_nacimiento: cliente.fecha_nacimiento || '',
        estado_civil: cliente.estado_civil || '',
        ocupacion: cliente.ocupacion || '',
        referencias: cliente.referencias || '',
        notas: cliente.notas || '',
      })
      setAvatarPreview(cliente.avatar_url || null)
      setAvatarFile(null)
      setRemoveAvatar(false)
    }
  }, [cliente])

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
          video: { facingMode: 'environment' },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let avatarUrl = removeAvatar ? '' : formData.avatar_url

      const uploadAvatar = async (targetId: string) => {
        if (!avatarFile) return avatarUrl
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `clientes/${targetId}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true,
            contentType: avatarFile.type,
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
        return data.publicUrl
      }

      if (cliente) {
        avatarUrl = await uploadAvatar(cliente.id)
        // Actualizar
        const { error } = await supabase
          .from('clientes')
          .update({
            ...formData,
            avatar_url: avatarUrl || null,
          })
          .eq('id', cliente.id)

        if (error) throw error
        notifySuccess('Cliente actualizado exitosamente')
      } else {
        // Crear
        const { data: created, error } = await supabase
          .from('clientes')
          .insert([{
            ...formData,
            avatar_url: avatarUrl || null,
            created_by: usuario?.id || null,
          }])
          .select()
          .single()

        if (error) throw error
        if (created?.id && avatarFile) {
          avatarUrl = await uploadAvatar(created.id)
          await supabase
            .from('clientes')
            .update({ avatar_url: avatarUrl || null })
            .eq('id', created.id)
        }
        notifySuccess('Cliente creado exitosamente')
      }

      onClose()
    } catch (error: any) {
      console.error('Error guardando cliente:', error)
      notifyError(error?.message ? `Error: ${error.message}` : 'Error al guardar cliente')
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
          <div className="avatar-uploader">
            <div className="avatar-preview">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Vista previa" />
              ) : (
                <User className="h-6 w-6 text-indigo-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Foto del cliente</p>
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
                      const file = new File([blob], `cliente-${Date.now()}.png`, { type: 'image/png' })
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Documento de Identidad *
              </label>
              <div className="field-wrap">
                <FileText className="field-icon" />
                <input
                  type="text"
                  required
                  value={formData.documento_identidad}
                  onChange={(e) =>
                    setFormData({ ...formData, documento_identidad: e.target.value })
                  }
                  className="input field-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <div className="field-wrap">
                <User className="field-icon" />
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="input field-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Apellido *</label>
              <div className="field-wrap">
                <User className="field-icon" />
                <input
                  type="text"
                  required
                  value={formData.apellido}
                  onChange={(e) =>
                    setFormData({ ...formData, apellido: e.target.value })
                  }
                  className="input field-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <div className="field-wrap">
                <Phone className="field-icon" />
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input field-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha de Nacimiento
              </label>
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

            <div>
              <label className="block text-sm font-medium mb-1">Estado Civil</label>
              <div className="field-wrap">
                <Users className="field-icon" />
                <select
                  value={formData.estado_civil}
                  onChange={(e) =>
                    setFormData({ ...formData, estado_civil: e.target.value })
                  }
                  className="input field-input"
                >
                  <option value="">Seleccionar...</option>
                  <option value="soltero">Soltero</option>
                  <option value="casado">Casado</option>
                  <option value="divorciado">Divorciado</option>
                  <option value="viudo">Viudo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ocupación</label>
              <div className="field-wrap">
                <Briefcase className="field-icon" />
                <input
                  type="text"
                  value={formData.ocupacion}
                  onChange={(e) =>
                    setFormData({ ...formData, ocupacion: e.target.value })
                  }
                  className="input field-input"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <div className="field-wrap">
              <Home className="field-icon" />
              <textarea
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                className="input field-textarea"
                rows={2}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Referencias</label>
            <div className="field-wrap">
              <Users className="field-icon" />
              <textarea
                value={formData.referencias}
                onChange={(e) =>
                  setFormData({ ...formData, referencias: e.target.value })
                }
                className="input field-textarea"
                rows={2}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <div className="field-wrap">
              <StickyNote className="field-icon" />
              <textarea
                value={formData.notas}
                onChange={(e) =>
                  setFormData({ ...formData, notas: e.target.value })
                }
                className="input field-textarea"
                rows={3}
              />
            </div>
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
