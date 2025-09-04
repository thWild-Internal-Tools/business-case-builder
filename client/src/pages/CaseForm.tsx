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
  // Additional fields for Step 1 per template
  const [category, setCategory] = useState<string>('Digital Transformation')
  const [timeBasis, setTimeBasis] = useState<'Monthly' | 'Quarterly'>('Monthly')
  const [durationValue, setDurationValue] = useState<number | ''>('' as any)
  const [durationUnit, setDurationUnit] = useState<'months' | 'quarters'>('months')
  const [currencyCode, setCurrencyCode] = useState<string>('USD')
  const [tags, setTags] = useState<string[]>([])
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
        setCategory(c.category || 'Digital Transformation')
        setTimeBasis((c.time_basis as any) || 'Monthly')
        setDurationValue((c.duration_value as any) ?? '')
        setDurationUnit((c.duration_unit as any) || 'months')
        setCurrencyCode(c.currency_code || 'USD')
        setTags(c.tags || [])
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
      const payload = {
        client_id: clientId,
        title,
        description: description || null,
        category,
        time_basis: timeBasis,
        duration_value: durationValue === '' ? null : Number(durationValue),
        duration_unit: durationUnit,
        currency_code: currencyCode,
        tags
      }
      if (isEdit && id) {
        const { tags, ...rest } = payload
        await updateCase(id, { ...rest, tags })
        navigate(`/cases/${id}/edit`)
      } else {
        const created = await createCase({ ...payload, status: 'Planning' })
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
          <h1 className="text-2xl text-neutral-800">{isEdit ? 'Edit Case Details' : 'Step 1: Business Case Details'}</h1>
          <p className="text-neutral-600 mt-1">Enter key case details to get started.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-6 max-w-4xl">
        {error && (
          <div className="mb-4 px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded">{error}</div>
        )}
        <div className="bg-white border border-neutral-300 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="mt-6">
            <label className="block text-sm text-neutral-800 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-500"
              placeholder="Brief description of the case"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-neutral-800 mb-2">Project Category</label>
              <div className="grid grid-cols-2 gap-3">
                {['Digital Transformation', 'Cost Optimization', 'Market Expansion', 'Process Improvement'].map((opt) => (
                  <label key={opt} className="flex items-center p-3 border border-neutral-300 rounded hover:bg-neutral-50">
                    <input
                      type="radio"
                      name="category"
                      className="mr-3"
                      checked={category === opt}
                      onChange={() => setCategory(opt)}
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-neutral-800 mb-1">Duration</label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min={0}
                  className="w-32 px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value === '' ? ('' as any) : Number(e.target.value))}
                  placeholder="e.g. 18"
                />
                <select
                  className="px-3 py-2 border border-neutral-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value as any)}
                >
                  <option value="months">Months</option>
                  <option value="quarters">Quarters</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-800 mb-2">Time Calculation Basis</label>
              <div className="flex space-x-6">
                {(['Monthly', 'Quarterly'] as const).map((opt) => (
                  <label key={opt} className="flex items-center">
                    <input
                      type="radio"
                      name="time_basis"
                      className="mr-2"
                      checked={timeBasis === opt}
                      onChange={() => setTimeBasis(opt)}
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-neutral-500 mt-1">Determines how costs and revenues are tracked.</p>
            </div>
            <div>
              <label className="block text-sm text-neutral-800 mb-1">Currency</label>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>
          </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm text-neutral-800 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((t) => (
                <span key={t} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                  {t}
                  <button
                    type="button"
                    className="ml-2 text-neutral-500 hover:text-neutral-700"
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                </span>
              ))}
            </div>
            <TagInput onAdd={(t) => setTags(Array.from(new Set([...tags, t])))} />
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

function TagInput({ onAdd }: { onAdd: (tag: string) => void }) {
  const [value, setValue] = React.useState('')
  function commit() {
    const v = value.trim()
    if (!v) return
    onAdd(v)
    setValue('')
  }
  return (
    <div className="flex items-center space-x-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            commit()
          }
        }}
        className="flex-1 px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-500"
        placeholder="Add tags and press Enter"
      />
      <button type="button" className="px-3 py-2 border border-neutral-300 rounded hover:bg-neutral-50" onClick={commit}>
        Add
      </button>
    </div>
  )
}
