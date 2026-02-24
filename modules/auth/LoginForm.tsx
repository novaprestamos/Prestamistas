'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ensureUsuarioForAuthUser } from '@/lib/usuario'
import { useRouter } from 'next/navigation'
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  IdCard,
  Phone,
  Flag,
  Map,
  MapPin,
  Home,
  Users,
  Calendar,
} from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const pais = 'Colombia'
  const region = 'Antioquia'
  const antioquiaCities = [
    'Abejorral',
    'Abriaqui',
    'Alejandria',
    'Amaga',
    'Amalfi',
    'Andes',
    'Angelopolis',
    'Angostura',
    'Anori',
    'Anza',
    'Apartado',
    'Arboletes',
    'Argelia',
    'Armenia',
    'Barbosa',
    'Bello',
    'Belmira',
    'Betania',
    'Betulia',
    'Briceño',
    'Buritica',
    'Caceres',
    'Caicedo',
    'Caldas',
    'Campamento',
    'Cañasgordas',
    'Caracoli',
    'Caramanta',
    'Carepa',
    'Carmen de Viboral',
    'Carolina',
    'Caucasia',
    'Chigorodo',
    'Cisneros',
    'Ciudad Bolivar',
    'Cocorna',
    'Concepcion',
    'Concordia',
    'Copacabana',
    'Dabeiba',
    'Donmatias',
    'Ebejico',
    'El Bagre',
    'El Carmen de Viboral',
    'El Peñol',
    'El Retiro',
    'El Santuario',
    'Entrerrios',
    'Envigado',
    'Fredonia',
    'Frontino',
    'Giraldo',
    'Girardota',
    'Gomez Plata',
    'Granada',
    'Guadalupe',
    'Guarne',
    'Guatape',
    'Heliconia',
    'Hispania',
    'Itagui',
    'Ituango',
    'Jardin',
    'Jerico',
    'La Ceja',
    'La Estrella',
    'La Pintada',
    'La Union',
    'Liborina',
    'Maceo',
    'Marinilla',
    'Medellin',
    'Montebello',
    'Murindo',
    'Mutata',
    'Nariño',
    'Nechi',
    'Necocli',
    'Olaya',
    'Peque',
    'Pueblorrico',
    'Puerto Berrio',
    'Puerto Nare',
    'Puerto Triunfo',
    'Remedios',
    'Retiro',
    'Rionegro',
    'Sabanalarga',
    'Sabaneta',
    'Salgar',
    'San Andres',
    'San Carlos',
    'San Francisco',
    'San Jeronimo',
    'San Jose de la Montana',
    'San Juan de Uraba',
    'San Luis',
    'San Pedro de los Milagros',
    'San Pedro de Uraba',
    'San Rafael',
    'San Roque',
    'San Vicente',
    'Santa Barbara',
    'Santa Fe de Antioquia',
    'Santa Rosa de Osos',
    'Santo Domingo',
    'Segovia',
    'Sonson',
    'Sopetran',
    'Tamesis',
    'Taraza',
    'Tarso',
    'Titiribi',
    'Toledo',
    'Turbo',
    'Uramita',
    'Urrao',
    'Valdivia',
    'Valparaiso',
    'Vegachi',
    'Venecia',
    'Vigia del Fuerte',
    'Yali',
    'Yarumal',
    'Yolombo',
    'Yondo',
    'Zaragoza',
  ]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cedula, setCedula] = useState('')
  const [celular, setCelular] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [direccion, setDireccion] = useState('')
  const [sexo, setSexo] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [notice, setNotice] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    try {
      // Intentar iniciar sesión con Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Verificar que el usuario existe en la tabla usuarios y obtener su rol
      if (data.user) {
        const usuarioDb = await ensureUsuarioForAuthUser(data.user)

        if (usuarioDb && usuarioDb.activo === false) {
          await supabase.auth.signOut()
          setError('Tu cuenta está pendiente de aprobación por un administrador.')
          return
        }

        // Redirigir al dashboard
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      console.error('Error en login:', err)
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice('')

    if (!nombre || !apellido || !cedula || !celular || !ciudad || !direccion || !sexo) {
      setError('Completa todos los campos requeridos para el registro.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            apellido,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        const response = await fetch('/api/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: authData.user.id,
            email,
            nombre,
            apellido,
            documento_identidad: cedula,
            celular,
            pais,
            region,
            ciudad,
            direccion,
            sexo,
            fecha_nacimiento: fechaNacimiento || null,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result?.error || 'No se pudo registrar el usuario')
        }
      }

      await supabase.auth.signOut()
      setNotice('Solicitud enviada. Un administrador debe aprobar tu acceso antes de poder ingresar.')
      setIsRegister(false)
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      console.error('Error en registro:', err)
      setError(err.message || 'No se pudo completar el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-right">
          <div className="login-header">
            <span className="login-header-label">
              {isRegister ? 'Registro de prestamistas' : 'Acceso exclusivo'}
            </span>
            <span className="login-header-status">
              <span className="login-dot"></span>
              Conexion segura
            </span>
          </div>

          <div className="login-title">
            <div className="login-title-icon">
              <LogIn className="h-10 w-10 text-white" />
            </div>
            <h2>{isRegister ? 'Crea tu cuenta' : 'Acceso Premium'}</h2>
            <p>
              {isRegister
                ? 'Solicita acceso y espera la aprobación del administrador'
                : 'Gestion integral de cartera y clientes'}
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
                <p className="login-error-title">Error de autenticacion</p>
                <p className="login-error-text">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="login-form">
            {isRegister && (
              <>
                <div className="login-register-grid">
                  <div>
                    <label className="login-label">Nombre</label>
                    <div className="login-input-wrap">
                      <User className="login-input-icon" />
                      <input
                        type="text"
                        required
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="login-input"
                        placeholder="Tu nombre"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="login-label">Apellido</label>
                    <div className="login-input-wrap">
                      <User className="login-input-icon" />
                      <input
                        type="text"
                        required
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        className="login-input"
                        placeholder="Tu apellido"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="login-register-grid">
                  <div>
                    <label className="login-label">Numero de cedula</label>
                    <div className="login-input-wrap">
                      <IdCard className="login-input-icon" />
                      <input
                        type="text"
                        required
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        className="login-input"
                        placeholder="Documento de identidad"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="login-label">Numero de celular</label>
                    <div className="login-input-wrap">
                      <Phone className="login-input-icon" />
                      <input
                        type="tel"
                        required
                        value={celular}
                        onChange={(e) => setCelular(e.target.value)}
                        className="login-input"
                        placeholder="Ej: 3001234567"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="login-register-grid">
                  <div>
                    <label className="login-label">Pais</label>
                    <div className="login-input-wrap">
                      <Flag className="login-input-icon" />
                      <input type="text" value={pais} disabled className="login-input" />
                    </div>
                  </div>
                  <div>
                    <label className="login-label">Region</label>
                    <div className="login-input-wrap">
                      <Map className="login-input-icon" />
                      <input type="text" value={region} disabled className="login-input" />
                    </div>
                  </div>
                </div>

                <div className="login-register-grid">
                  <div>
                    <label className="login-label">Ciudad (Antioquia)</label>
                    <div className="login-input-wrap">
                      <MapPin className="login-input-icon" />
                      <select
                        required
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        className="login-input"
                        disabled={loading}
                      >
                        <option value="">Selecciona una ciudad</option>
                        {antioquiaCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="login-label">Direccion</label>
                    <div className="login-input-wrap">
                      <Home className="login-input-icon" />
                      <input
                        type="text"
                        required
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        className="login-input"
                        placeholder="Direccion completa"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="login-register-grid">
                  <div>
                    <label className="login-label">Sexo</label>
                    <div className="login-input-wrap">
                      <Users className="login-input-icon" />
                      <select
                        required
                        value={sexo}
                        onChange={(e) => setSexo(e.target.value)}
                        className="login-input"
                        disabled={loading}
                      >
                        <option value="">Selecciona una opcion</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="login-label">Fecha de nacimiento</label>
                    <div className="login-input-wrap">
                      <Calendar className="login-input-icon" />
                      <input
                        type="date"
                        value={fechaNacimiento}
                        onChange={(e) => setFechaNacimiento(e.target.value)}
                        className="login-input"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="login-label">Correo Electronico</label>
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

            <div>
              <label className="login-label">Contrasena</label>
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
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="login-toggle"
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="login-label">Confirmar contrasena</label>
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
            )}

            {!isRegister && (
              <div className="login-actions">
                <label className="login-check">
                  <input type="checkbox" />
                  Mantener sesion activa
                </label>
                <Link href="/recuperar-acceso" className="login-link">
                  Recuperar acceso
                </Link>
              </div>
            )}

            <button type="submit" disabled={loading} className="login-button">
              {loading ? (
                <span className="login-loading">
                  <svg
                    className="login-spinner"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isRegister ? 'Registrando...' : 'Iniciando sesion...'}
                </span>
              ) : (
                isRegister ? 'Solicitar acceso' : 'Iniciar Sesion'
              )}
            </button>
          </form>

          <div className="login-switch">
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button
              type="button"
              className="login-link"
              onClick={() => {
                setIsRegister((prev) => !prev)
                setError('')
                setNotice('')
              }}
            >
              {isRegister ? 'Inicia sesion' : 'Registrate'}
            </button>
          </div>

          <div className="login-badges">
            <div className="login-badge">
              <ShieldCheck className="h-4 w-4" />
              256-bit SSL
            </div>
            <div className="login-badge">
              <Sparkles className="h-4 w-4" />
              UI Premium
            </div>
            <div className="login-badge">
              <TrendingUp className="h-4 w-4" />
              Analitica
            </div>
          </div>

          <div className="login-footer">
            <p>
              ¿Necesitas ayuda?{' '}
              <a href="#" className="login-link">
                Contacta al administrador
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
