'use client'

import { useEffect, useState } from 'react'
import { supabase, Configuracion } from '@/lib/supabase'
import { Save } from 'lucide-react'
import { notifyError, notifySuccess } from '@/lib/notify'

export function ConfiguracionModule() {
  const [configs, setConfigs] = useState<Configuracion[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, string>>({})

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('configuracion')
        .select('*')
        .order('clave')

      if (error) throw error
      setConfigs(data || [])
      const initialEdits = (data || []).reduce<Record<string, string>>((acc, config) => {
        acc[config.id] = config.valor ?? ''
        return acc
      }, {})
      setEdits(initialEdits)
    } catch (error) {
      console.error('Error cargando configuración:', error)
      notifyError('Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (config: Configuracion) => {
    const nuevoValor = edits[config.id] ?? ''

    if (config.tipo === 'numero' && nuevoValor.trim() !== '' && Number.isNaN(Number(nuevoValor))) {
      notifyError('Ingresa un número válido')
      return
    }

    try {
      setSavingId(config.id)
      const { error } = await supabase
        .from('configuracion')
        .update({ valor: nuevoValor })
        .eq('id', config.id)

      if (error) throw error
      loadConfigs()
      notifySuccess('Configuración actualizada exitosamente')
    } catch (error) {
      console.error('Error actualizando configuración:', error)
      notifyError('Error al actualizar configuración')
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando configuración...</div>
  }

  return (
    <div className="page">
      <div className="hero-card">
        <h1 className="hero-title">Configuración</h1>
        <p className="hero-subtitle">Parámetros clave del sistema</p>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Parámetros del Sistema</h2>
            <p className="panel-subtitle">Actualiza los valores operativos</p>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            {savingId ? 'Guardando cambios...' : 'Ediciones en borrador'}
          </div>
        </div>
        <div className="panel-body">
          <div className="grid gap-5">
            {configs.map((config) => {
              const etiqueta = config.clave.replace(/_/g, ' ')
              const titulo = etiqueta.replace(/\b\w/g, (letra) => letra.toUpperCase())

              return (
              <div key={config.id} className="card flex flex-col gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{titulo}</h3>
                  </div>
                  <span className="badge badge-primary w-fit">
                    {config.tipo === 'numero'
                      ? 'Numérico'
                      : config.tipo === 'booleano'
                        ? 'Booleano'
                        : 'Texto'}
                  </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {config.tipo === 'booleano' ? (
                    <select
                      value={edits[config.id] ?? ''}
                      onChange={(e) =>
                        setEdits((prev) => ({ ...prev, [config.id]: e.target.value }))
                      }
                      className="input"
                      disabled={savingId === config.id}
                    >
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  ) : config.tipo === 'numero' ? (
                    <input
                      type="number"
                      inputMode="decimal"
                      value={edits[config.id] ?? ''}
                      onChange={(e) =>
                        setEdits((prev) => ({ ...prev, [config.id]: e.target.value }))
                      }
                      className="input"
                      disabled={savingId === config.id}
                    />
                  ) : (
                    <input
                      type="text"
                      value={edits[config.id] ?? ''}
                      onChange={(e) =>
                        setEdits((prev) => ({ ...prev, [config.id]: e.target.value }))
                      }
                      className="input"
                      disabled={savingId === config.id}
                    />
                  )}

                  <button
                    onClick={() => handleUpdate(config)}
                    className="btn btn-primary inline-flex items-center gap-2"
                    disabled={savingId === config.id}
                  >
                    <Save className="h-4 w-4" />
                    Guardar
                  </button>
                </div>
              </div>
            )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
