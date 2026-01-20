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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600 text-lg">Resumen general de tu sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card-hover group">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div className={`bg-gradient-to-br ${stat.gradient} p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {stats.prestamosVencidos > 0 && (
        <div className="card border-l-4 border-red-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Préstamos Vencidos
              </h2>
              <p className="text-sm text-gray-600">
                {stats.prestamosVencidos} préstamo(s) requieren atención
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {prestamosVencidos.map((prestamo) => (
              <div
                key={prestamo.id}
                className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Préstamo: {prestamo.id.substring(0, 8)}...
                  </p>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Vencido: {format(new Date(prestamo.fecha_vencimiento), 'dd/MM/yyyy')}</span>
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
