import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCase } from '../services/cases'
import type { BusinessCaseRecord } from '../types'
import ItemsPanel from '../components/ItemsPanel'

export default function CaseEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [record, setRecord] = useState<BusinessCaseRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getCase(id)
      .then((r) => setRecord(r))
      .catch((e) => setError(e.message || 'Failed to load case'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="flex-1 bg-neutral-50 min-h-screen">
      <div className="bg-white border-b border-neutral-300 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-neutral-500">
            <Link to="/cases" className="hover:underline">Cases</Link>
            <span className="mx-2">/</span>
            <span>{record?.title || (loading ? 'Loading…' : 'Case')}</span>
          </div>
          <h1 className="text-2xl text-neutral-800 mt-1">{record?.title || '—'}</h1>
          <p className="text-neutral-600 mt-1">
            {record ? (
              <>
                <span className="mr-3">Client: {record.client_name || '—'}</span>
                <span className="mr-3">Status: {record.status}</span>
              </>
            ) : loading ? (
              'Fetching case details…'
            ) : (
              'Case not found'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {record && (
            <button
              onClick={() => navigate(`/cases/${record.id}/edit-details`)}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50"
            >
              Edit Details
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded">{error}</div>
        )}

        {/* Primary content area resembling case dashboard with item management */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="bg-white border border-neutral-300 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-neutral-800">Cost & Revenue Items</h3>
              </div>
              <ItemsPanel caseId={record?.id ?? null} />
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="bg-white border border-neutral-300 rounded-lg p-4">
              <h3 className="text-lg text-neutral-800 mb-3">Case Overview</h3>
              <ul className="text-sm text-neutral-700 space-y-2">
                <li>
                  <span className="text-neutral-500">Client:</span> {record?.client_name || '—'}
                </li>
                <li>
                  <span className="text-neutral-500">Status:</span> {record?.status || '—'}
                </li>
                <li>
                  <span className="text-neutral-500">Created:</span> {record ? new Date(record.created_at).toLocaleString() : '—'}
                </li>
                <li>
                  <span className="text-neutral-500">Updated:</span> {record ? new Date(record.updated_at).toLocaleString() : '—'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

