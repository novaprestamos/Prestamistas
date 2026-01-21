'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, FileText, DollarSign, Settings, BarChart, User, LogOut, UserCog } from 'lucide-react'
import { useUsuario } from '@/lib/useUsuario'
import { logout } from '@/lib/auth'

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { usuario } = useUsuario()

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/clientes', label: 'Clientes', icon: Users },
    { href: '/prestamos', label: 'Préstamos', icon: FileText },
    { href: '/pagos', label: 'Pagos', icon: DollarSign },
    { href: '/reportes', label: 'Reportes', icon: BarChart },
    { href: '/configuracion', label: 'Configuración', icon: Settings },
  ]

  const handleLogout = async () => {
    if (confirm('¿Está seguro de cerrar sesión?')) {
      await logout()
    }
  }

  return (
    <nav className="app-nav">
      <div className="app-nav-container">
        <div className="app-nav-brand">
          <div className="app-nav-logo">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="app-nav-title">Sistema de Prestamistas</div>
            <div className="app-nav-subtitle">
              {usuario?.rol === 'admin' ? 'Administrador' : 'Prestamista'}
            </div>
          </div>
        </div>

        <div className="app-nav-links">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`app-nav-link ${isActive ? 'app-nav-link-active' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {usuario?.rol === 'admin' && (
            <Link
              href="/usuarios"
              className={`app-nav-link ${pathname === '/usuarios' ? 'app-nav-link-active' : ''}`}
            >
              <UserCog className="h-4 w-4" />
              <span>Usuarios</span>
            </Link>
          )}
        </div>

        <div className="app-nav-footer">
          <Link href="/perfil" className="app-nav-user">
            <User className="h-4 w-4" />
            <span>{usuario?.nombre || 'Perfil'}</span>
          </Link>
          <button onClick={handleLogout} className="app-nav-button" title="Cerrar sesión">
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
