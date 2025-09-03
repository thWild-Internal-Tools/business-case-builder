import React from 'react'

type Props = {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white border border-neutral-300 rounded-lg shadow-xl w-full max-w-sm mx-4">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h3 className="text-lg text-neutral-900">{title}</h3>
        </div>
        <div className="px-5 py-4 text-neutral-700">{message}</div>
        <div className="px-5 py-3 border-t border-neutral-200 flex justify-end space-x-2">
          <button
            className="px-4 py-2 border border-neutral-300 rounded hover:bg-neutral-50"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

