'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Lock, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    // Verificar que existe sesión de recuperación (supabase la crea al entrar desde el link)
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        setError('El enlace de recuperación no es válido o ya fue utilizado.')
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice('')

    if (!password || !confirmPassword) {
      setError('Ingresa y confirma la nueva contraseña.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    try {
      setLoading(true)
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) throw updateError

      setNotice('Tu contraseña fue actualizada correctamente. Ahora puedes iniciar sesión.')
      setPassword('')
      setConfirmPassword('')

      // Opcional: redirigir al login después de unos segundos
      setTimeout(() => {
        router.push('/login')
      }, 2500)
    } catch (err: any) {
      console.error('Error actualizando contraseña:', err)
      setError(err.message || 'No se pudo actualizar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-right">
          <div className="login-header">
            <span className="login-header-label">Seguridad de cuenta</span>
            <span className="login-header-status">
              <span className="login-dot" />
              Restablecer contraseña
            </span>
          </div>

          <div className="login-title">
            <div className="login-title-icon">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <h2>Nueva contraseña</h2>
            <p>Define una nueva contraseña para tu cuenta de Prestamistas.</p>
          </div>

          {notice && (
            <div className="login-notice">
              <ShieldCheck className="h-5 w-5" />
              <div>
                <p className="login-notice-title">Contraseña actualizada</p>
                <p className="login-notice-text">{notice}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="login-error">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="login-error-title">No se pudo completar la solicitud</p>
                <p className="login-error-text">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label className="login-label">Nueva contraseña</label>
              <div className="login-input-wrap">
                <Lock className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input login-input-password"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="login-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <div>
              <label className="login-label">Confirmar contraseña</label>
              <div className="login-input-wrap">
                <Lock className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="login-input login-input-password"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-button">
              {loading ? 'Actualizando contraseña...' : 'Guardar nueva contraseña'}
            </button>
          </form>

          <div className="login-switch">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio de sesión</span>
            <Link href="/login" className="login-link">
              Ir al acceso
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

