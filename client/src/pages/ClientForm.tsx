import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createClient, getClient, updateClient } from '../services/clients'

export default function ClientForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit || !id) return
    getClient(id)
      .then((c) => {
        setName(c.name)
        setNotes(c.notes || '')
      })
      .catch((e) => setError(e.message || 'Failed to load client'))
  }, [id, isEdit])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (isEdit && id) {
        await updateClient(id, { name, notes: notes || null })
      } else {
        await createClient({ name, notes: notes || null })
      }
      navigate('/clients')
    } catch (e: any) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 bg-neutral-50 min-h-screen">
      <div className="bg-white border-b border-neutral-300 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-neutral-800">{isEdit ? 'Edit Client' : 'New Client'}</h1>
          <p className="text-neutral-600 mt-1">{isEdit ? 'Update client details.' : 'Create a new client.'}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-6 max-w-2xl">
        {error && (
          <div className="mb-4 px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded">{error}</div>
        )}
        <div className="bg-white border border-neutral-300 rounded-lg p-4">
          <div className="mb-4">
            <label className="block text-sm text-neutral-800 mb-1">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-500"
              placeholder="Acme Corporation"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-neutral-800 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-500"
              rows={4}
              placeholder="Optional notes about the client"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              disabled={saving}
              className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-900 disabled:opacity-60"
              type="submit"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-neutral-300 rounded hover:bg-neutral-50"
              onClick={() => navigate('/clients')}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

