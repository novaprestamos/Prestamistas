'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, ShieldCheck, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react'
import Link from 'next/link'

export default function RecuperarAccesoPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice('')

    if (!email) {
      setError('Ingresa tu correo electrónico para continuar.')
      return
    }

    try {
      setLoading(true)
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
      })

      if (resetError) throw resetError

      setNotice(
        'Si el correo está registrado, te enviamos un enlace seguro para restablecer tu contraseña. Revisa tu bandeja de entrada y la carpeta de spam.'
      )
    } catch (err: any) {
      console.error('Error en recuperación de acceso:', err)
      setError(err.message || 'No se pudo enviar el correo de recuperación.')
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
              Proceso verificado
            </span>
          </div>

          <div className="login-title">
            <div className="login-title-icon">
              <KeyRound className="h-10 w-10 text-white" />
            </div>
            <h2>Recuperar acceso</h2>
            <p>
              Ingresa el correo asociado a tu cuenta y te enviaremos un enlace seguro para
              restablecer tu contraseña.
            </p>
          </div>

          {notice && (
            <div className="login-notice">
              <ShieldCheck className="h-5 w-5" />
              <div>
                <p className="login-notice-title">Solicitud enviada</p>
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
              <label className="login-label">Correo electrónico</label>
              <div className="login-input-wrap">
                <Mail className="login-input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  placeholder="correo@ejemplo.com"
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-button">
              {loading ? 'Enviando instrucciones...' : 'Enviar enlace de recuperación'}
            </button>
          </form>

          <div className="login-switch">
            <ArrowLeft className="h-4 w-4" />
            <span>¿Recordaste tu contraseña?</span>
            <Link href="/login" className="login-link">
              Volver al acceso
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

