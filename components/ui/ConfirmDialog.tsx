'use client'

import { ReactNode } from 'react'

type ConfirmDialogProps = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  open,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="modal-backdrop">
      <div className="modal-card max-w-lg">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            type="button"
            className="icon-button-soft"
            onClick={onCancel}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="modal-form">
          {description && (
            <p className="text-sm text-slate-600">
              {description}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

