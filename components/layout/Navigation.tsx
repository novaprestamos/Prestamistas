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
    <nav className="bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 text-white shadow-xl border-b border-primary-600">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Sistema de Prestamistas</h1>
              <p className="text-xs text-primary-200">{usuario?.rol === 'admin' ? 'Administrador' : 'Prestamista'}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-primary-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
            
            {usuario?.rol === 'admin' && (
              <Link
                href="/usuarios"
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  pathname === '/usuarios'
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <UserCog className="h-5 w-5" />
                <span className="font-medium">Usuarios</span>
              </Link>
            )}
            
            <div className="border-l border-white/20 h-10 mx-3"></div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Link
                href="/perfil"
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  pathname === '/perfil'
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <User className="h-4 w-4" />
                </div>
                <span className="font-medium">{usuario?.nombre || 'Perfil'}</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-primary-100 hover:bg-red-500/20 hover:text-white transition-all duration-200 border border-transparent hover:border-red-400/30"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
