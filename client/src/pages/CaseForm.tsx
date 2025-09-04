import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createCase, getCase, updateCase } from '../services/cases'
import { listClients } from '../services/clients'
import type { Client } from '../types'

export default function CaseForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'Active' | 'Planning' | 'Review'>('Planning')
  const [clients, setClients] = useState<Client[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listClients().then(setClients).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit || !id) return
    getCase(id)
      .then((c) => {
        setTitle(c.title)
        setClientId(c.client_id)
        setDescription(c.description || '')
        setStatus(c.status)
      })
      .catch((e) => setError(e.message || 'Failed to load case'))
  }, [id, isEdit])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !clientId) {
      setError('Title and Client are required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = { client_id: clientId, title, description: description || null, status }
      if (isEdit && id) {
        await updateCase(id, payload)
        navigate(`/cases/${id}/edit`)
      } else {
        const created = await createCase(payload)
        navigate(`/cases/${created.id}/edit`)
      }
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
          <h1 className="text-2xl text-neutral-800">{isEdit ? 'Edit Case' : 'Create Business Case'}</h1>
          <p className="text-neutral-600 mt-1">{isEdit ? 'Update case details.' : 'Enter case details below.'}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-6 max-w-3xl">
        {error && (
          <div className="mb-4 px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded">{error}</div>
        )}
        <div className="bg-white border border-neutral-300 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-800 mb-1">Business Case Name *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-500"
                placeholder="Digital Transformation Initiative"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-800 mb-1">Client *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-neutral-800 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-500"
              placeholder="Brief description of the case"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm text-neutral-800 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-48 px-3 py-2 border border-neutral-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
            >
              <option>Planning</option>
              <option>Active</option>
              <option>Review</option>
            </select>
          </div>

          <div className="mt-6 flex items-center space-x-3">
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
              onClick={() => navigate('/cases')}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
