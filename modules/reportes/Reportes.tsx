'use client'

import { useEffect, useState } from 'react'
import { supabase, Prestamo, Pago, Cliente } from '@/lib/supabase'
import { Download, Calendar } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export function Reportes() {
  const [reporteData, setReporteData] = useState({
    fechaInicio: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    fechaFin: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  })
  const [reportes, setReportes] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generarReporte = async () => {
    try {
      setLoading(true)

      // Préstamos en el rango
      const { data: prestamos } = await supabase
        .from('prestamos')
        .select(`
          *,
          cliente:clientes(*)
        `)
        .gte('fecha_inicio', reporteData.fechaInicio)
        .lte('fecha_inicio', reporteData.fechaFin)
        .order('fecha_inicio', { ascending: false })

      // Pagos en el rango
      const { data: pagos } = await supabase
        .from('pagos')
        .select(`
          *,
          prestamo:prestamos(
            *,
            cliente:clientes(*)
          )
        `)
        .gte('fecha_pago', reporteData.fechaInicio)
        .lte('fecha_pago', reporteData.fechaFin)
        .order('fecha_pago', { ascending: false })

      const totalPrestamos = prestamos?.reduce(
        (sum, p) => sum + p.monto_principal,
        0
      ) || 0
      const totalPagos = pagos?.reduce((sum, p) => sum + p.monto, 0) || 0

      setReportes({
        prestamos: prestamos || [],
        pagos: pagos || [],
        totalPrestamos,
        totalPagos,
        cantidadPrestamos: prestamos?.length || 0,
        cantidadPagos: pagos?.length || 0,
      })
    } catch (error) {
      console.error('Error generando reporte:', error)
      alert('Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  const exportarCSV = () => {
    if (!reportes) return

    // CSV de préstamos
    const headersPrestamos = [
      'Fecha',
      'Cliente',
      'Documento',
      'Monto Principal',
      'Monto Total',
      'Estado',
    ]
    const rowsPrestamos = reportes.prestamos.map((p: any) => [
      p.fecha_inicio,
      `${p.cliente?.nombre} ${p.cliente?.apellido}`,
      p.cliente?.documento_identidad,
      p.monto_principal,
      p.monto_total,
      p.estado,
    ])

    const csvPrestamos =
      headersPrestamos.join(',') +
      '\n' +
      rowsPrestamos.map((row: any[]) => row.join(',')).join('\n')

    // Descargar
    const blob = new Blob([csvPrestamos], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_prestamos_${reporteData.fechaInicio}_${reporteData.fechaFin}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reportes</h1>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Generar Reporte</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={reporteData.fechaInicio}
              onChange={(e) =>
                setReporteData({ ...reporteData, fechaInicio: e.target.value })
              }
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Fin</label>
            <input
              type="date"
              value={reporteData.fechaFin}
              onChange={(e) =>
                setReporteData({ ...reporteData, fechaFin: e.target.value })
              }
              className="input"
            />
          </div>
        </div>
        <button
          onClick={generarReporte}
          disabled={loading}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Calendar className="h-5 w-5" />
          <span>{loading ? 'Generando...' : 'Generar Reporte'}</span>
        </button>
      </div>

      {reportes && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Préstamos</p>
              <p className="text-2xl font-bold">{reportes.cantidadPrestamos}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Total Prestado</p>
              <p className="text-2xl font-bold text-primary-700">
                ${reportes.totalPrestamos.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Pagos</p>
              <p className="text-2xl font-bold">{reportes.cantidadPagos}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Total Pagado</p>
              <p className="text-2xl font-bold text-green-600">
                ${reportes.totalPagos.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Préstamos</h2>
              <button
                onClick={exportarCSV}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Exportar CSV</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Cliente</th>
                    <th className="text-left p-2">Monto Principal</th>
                    <th className="text-left p-2">Monto Total</th>
                    <th className="text-left p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reportes.prestamos.map((prestamo: any) => (
                    <tr key={prestamo.id} className="border-b">
                      <td className="p-2">
                        {format(new Date(prestamo.fecha_inicio), 'dd/MM/yyyy')}
                      </td>
                      <td className="p-2">
                        {prestamo.cliente?.nombre} {prestamo.cliente?.apellido}
                      </td>
                      <td className="p-2">
                        ${prestamo.monto_principal.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-2">
                        ${prestamo.monto_total.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            prestamo.estado === 'activo'
                              ? 'bg-blue-100 text-blue-800'
                              : prestamo.estado === 'pagado'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {prestamo.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
