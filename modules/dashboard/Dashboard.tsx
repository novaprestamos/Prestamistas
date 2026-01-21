'use client'

import { useEffect, useState } from 'react'
import { supabase, Prestamo, Pago, Cliente } from '@/lib/supabase'
import { DollarSign, Users, FileText, TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useUsuario } from '@/lib/useUsuario'

export function Dashboard() {
  const { usuario } = useUsuario()
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalPrestamos: 0,
    prestamosActivos: 0,
    prestamosVencidos: 0,
    montoPrestado: 0,
    montoPendiente: 0,
    montoRecuperado: 0,
    pagosMes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [prestamosVencidos, setPrestamosVencidos] = useState<Prestamo[]>([])

  useEffect(() => {
    if (usuario) {
      loadStats()
    }
  }, [usuario])

  const loadStats = async () => {
    if (!usuario) return

    try {
      setLoading(true)

      // Construir queries con filtro de usuario si no es admin
      const isAdmin = usuario.rol === 'admin'
      const userFilter = isAdmin ? {} : { created_by: usuario.id }

      // Total clientes
      let clientesQuery = supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)
      
      if (!isAdmin) {
        clientesQuery = clientesQuery.eq('created_by', usuario.id)
      }

      const { count: totalClientes } = await clientesQuery

      // Total préstamos
      let prestamosQuery = supabase
        .from('prestamos')
        .select('*', { count: 'exact', head: true })
      
      if (!isAdmin) {
        prestamosQuery = prestamosQuery.eq('created_by', usuario.id)
      }
      const { count: totalPrestamos } = await prestamosQuery

      // Préstamos activos
      let activosQuery = supabase
        .from('prestamos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo')
      
      if (!isAdmin) {
        activosQuery = activosQuery.eq('created_by', usuario.id)
      }
      const { count: prestamosActivos } = await activosQuery

      // Préstamos vencidos
      let vencidosQuery = supabase
        .from('prestamos')
        .select('*')
        .eq('estado', 'vencido')
      
      if (!isAdmin) {
        vencidosQuery = vencidosQuery.eq('created_by', usuario.id)
      }
      
      const { data: vencidos } = await vencidosQuery
        .order('fecha_vencimiento', { ascending: true })
        .limit(10)

      setPrestamosVencidos(vencidos || [])

      const { count: prestamosVencidosCount } = await vencidosQuery
        .select('*', { count: 'exact', head: true })

      // Montos
      let montosQuery = supabase
        .from('prestamos')
        .select('monto_principal, monto_pendiente, monto_pagado')
      
      if (!isAdmin) {
        montosQuery = montosQuery.eq('created_by', usuario.id)
      }
      const { data: prestamosData } = await montosQuery

      const montoPrestado =
        prestamosData?.reduce((sum, p) => sum + p.monto_principal, 0) || 0
      const montoPendiente =
        prestamosData?.reduce((sum, p) => sum + p.monto_pendiente, 0) || 0
      const montoRecuperado =
        prestamosData?.reduce((sum, p) => sum + p.monto_pagado, 0) || 0

      // Pagos del mes
      const inicioMes = startOfMonth(new Date())
      const finMes = endOfMonth(new Date())

      let pagosQuery = supabase
        .from('pagos')
        .select('monto, prestamo_id')
        .gte('fecha_pago', format(inicioMes, 'yyyy-MM-dd'))
        .lte('fecha_pago', format(finMes, 'yyyy-MM-dd'))
      
      // Si no es admin, filtrar por préstamos del usuario
      if (!isAdmin) {
        const { data: userPrestamos } = await supabase
          .from('prestamos')
          .select('id')
          .eq('created_by', usuario.id)
        
        const prestamoIds = userPrestamos?.map((p) => p.id) || []
        if (prestamoIds.length > 0) {
          pagosQuery = pagosQuery.in('prestamo_id', prestamoIds)
        } else {
          // Si no tiene préstamos, no hay pagos
          setStats({
            totalClientes: totalClientes || 0,
            totalPrestamos: totalPrestamos || 0,
            prestamosActivos: prestamosActivos || 0,
            prestamosVencidos: prestamosVencidosCount || 0,
            montoPrestado,
            montoPendiente,
            montoRecuperado,
            pagosMes: 0,
          })
          setLoading(false)
          return
        }
      }

      const { data: pagosMesData } = await pagosQuery

      const pagosMes = pagosMesData?.reduce((sum, p) => sum + p.monto, 0) || 0

      setStats({
        totalClientes: totalClientes || 0,
        totalPrestamos: totalPrestamos || 0,
        prestamosActivos: prestamosActivos || 0,
        prestamosVencidos: prestamosVencidosCount || 0,
        montoPrestado,
        montoPendiente,
        montoRecuperado,
        pagosMes,
      })
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Clientes',
      value: stats.totalClientes,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Préstamos Activos',
      value: stats.prestamosActivos,
      icon: FileText,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'Monto Prestado',
      value: `$${stats.montoPrestado.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      gradient: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-700',
    },
    {
      title: 'Monto Pendiente',
      value: `$${stats.montoPendiente.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: TrendingUp,
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      title: 'Monto Recuperado',
      value: `$${stats.montoRecuperado.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      title: 'Pagos del Mes',
      value: `$${stats.pagosMes.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  ]

  return (
    <div className="page animate-fade-in">
      <div className="hero-card">
        <h1 className="hero-title">Dashboard</h1>
        <p className="hero-subtitle">Resumen general de tu sistema y métricas clave</p>
        <div className="page-actions">
          <div className="panel px-4 py-2 flex items-center gap-2 text-sm text-gray-600">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Estado: {stats.prestamosVencidos > 0 ? 'Atención requerida' : 'Operación estable'}
          </div>
        </div>
      </div>

      <div className="stat-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="kpi-card">
              <div>
                <p className="stat-label">{stat.title}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
              <div className={`kpi-icon ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          )
        })}
      </div>

      {stats.prestamosVencidos > 0 && (
        <div className="panel">
          <div className="panel-header">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="panel-title">Préstamos Vencidos</h2>
                <p className="panel-subtitle">
                  {stats.prestamosVencidos} préstamo(s) requieren atención
                </p>
              </div>
            </div>
          </div>
          <div className="panel-body space-y-3">
            {prestamosVencidos.map((prestamo) => (
              <div
                key={prestamo.id}
                className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Préstamo: {prestamo.id.substring(0, 8)}...
                  </p>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Vencido: {format(new Date(prestamo.fecha_vencimiento), 'dd/MM/yyyy')}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    ${prestamo.monto_pendiente.toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Pendiente</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
