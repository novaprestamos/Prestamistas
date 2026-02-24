'use client'

import { useEffect, useState } from 'react'
import { supabase, Prestamo, Pago, Cliente } from '@/lib/supabase'
import { Download, Calendar } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { notifyError } from '@/lib/notify'

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
      notifyError('Error al generar reporte')
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
    <div className="page animate-fade-in">
      <div className="hero-card">
        <h1 className="hero-title">Reportes</h1>
        <p className="hero-subtitle">Genera reportes por rangos de fecha</p>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Generar Reporte</h2>
            <p className="panel-subtitle">Selecciona el rango que deseas analizar</p>
          </div>
        </div>
        <div className="panel-body space-y-4">
          <div className="filter-panel">
            <div className="filter-group">
              <span className="filter-label">Fecha Inicio</span>
              <div className="filter-input">
                <Calendar className="filter-icon" />
                <input
                  type="date"
                  value={reporteData.fechaInicio}
                  onChange={(e) =>
                    setReporteData({ ...reporteData, fechaInicio: e.target.value })
                  }
                  className="input filter-input-field"
                />
              </div>
            </div>
            <div className="filter-group">
              <span className="filter-label">Fecha Fin</span>
              <div className="filter-input">
                <Calendar className="filter-icon" />
                <input
                  type="date"
                  value={reporteData.fechaFin}
                  onChange={(e) =>
                    setReporteData({ ...reporteData, fechaFin: e.target.value })
                  }
                  className="input filter-input-field"
                />
              </div>
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
      </div>

      {reportes && (
        <div className="space-y-6">
          <div className="stat-grid">
            <div className="kpi-card">
              <div>
                <p className="stat-label">Préstamos</p>
                <p className="stat-value">{reportes.cantidadPrestamos}</p>
              </div>
              <div className="kpi-icon">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <div className="kpi-card">
              <div>
                <p className="stat-label">Total Prestado</p>
                <p className="stat-value text-primary-700">
                ${reportes.totalPrestamos.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                </p>
              </div>
              <div className="kpi-icon">
                <Download className="h-5 w-5" />
              </div>
            </div>
            <div className="kpi-card">
              <div>
                <p className="stat-label">Pagos</p>
                <p className="stat-value">{reportes.cantidadPagos}</p>
              </div>
              <div className="kpi-icon">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <div className="kpi-card">
              <div>
                <p className="stat-label">Total Pagado</p>
                <p className="stat-value text-green-600">
                ${reportes.totalPagos.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                </p>
              </div>
              <div className="kpi-icon">
                <Download className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Préstamos</h2>
                <p className="panel-subtitle">Detalle del rango seleccionado</p>
              </div>
              <button
                onClick={exportarCSV}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Exportar CSV</span>
              </button>
            </div>
            <div className="panel-body overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Monto Principal</th>
                    <th>Monto Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reportes.prestamos.map((prestamo: any) => (
                    <tr key={prestamo.id}>
                      <td>
                        {format(new Date(prestamo.fecha_inicio), 'dd/MM/yyyy')}
                      </td>
                      <td>
                        {prestamo.cliente?.nombre} {prestamo.cliente?.apellido}
                      </td>
                      <td>
                        ${prestamo.monto_principal.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        ${prestamo.monto_total.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
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
