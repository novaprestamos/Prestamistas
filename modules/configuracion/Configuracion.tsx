'use client'

import { useEffect, useState } from 'react'
import { supabase, Configuracion } from '@/lib/supabase'
import { Save } from 'lucide-react'

export function ConfiguracionModule() {
  const [configs, setConfigs] = useState<Configuracion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
    } catch (error) {
      console.error('Error cargando configuración:', error)
      alert('Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: string, nuevoValor: string) => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('configuracion')
        .update({ valor: nuevoValor })
        .eq('id', id)

      if (error) throw error
      loadConfigs()
      alert('Configuración actualizada exitosamente')
    } catch (error) {
      console.error('Error actualizando configuración:', error)
      alert('Error al actualizar configuración')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando configuración...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configuración</h1>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Parámetros del Sistema</h2>
        <div className="space-y-4">
          {configs.map((config) => (
            <div key={config.id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    {config.clave.replace(/_/g, ' ').toUpperCase()}
                  </label>
                  {config.descripcion && (
                    <p className="text-sm text-gray-600 mb-2">{config.descripcion}</p>
                  )}
                  {config.tipo === 'booleano' ? (
                    <select
                      value={config.valor}
                      onChange={(e) => handleUpdate(config.id, e.target.value)}
                      className="input"
                      disabled={saving}
                    >
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  ) : config.tipo === 'numero' ? (
                    <input
                      type="number"
                      value={config.valor}
                      onChange={(e) => handleUpdate(config.id, e.target.value)}
                      className="input"
                      disabled={saving}
                    />
                  ) : (
                    <input
                      type="text"
                      value={config.valor}
                      onChange={(e) => handleUpdate(config.id, e.target.value)}
                      className="input"
                      disabled={saving}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
