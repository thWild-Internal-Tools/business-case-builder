import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listCases, deleteCase } from '../services/cases'
import type { BusinessCaseRecord } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'

export default function CasesList() {
  const [rows, setRows] = useState<BusinessCaseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    listCases()
      .then(setRows)
      .catch((e) => setError(e.message || 'Failed to load cases'))
      .finally(() => setLoading(false))
  }, [])

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [pendingDeleteTitle, setPendingDeleteTitle] = useState<string>('')

  function confirmDelete(id: string, title: string) {
    setPendingDeleteId(id)
    setPendingDeleteTitle(title)
  }

  async function handleDeleteConfirmed() {
    if (!pendingDeleteId) return
    await deleteCase(pendingDeleteId)
    setRows((s) => s.filter((c) => c.id !== pendingDeleteId))
    setPendingDeleteId(null)
  }

  return (
    <div className="flex-1 bg-neutral-50 min-h-screen">
      <div className="bg-white border-b border-neutral-300 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-neutral-800">Business Cases</h1>
          <p className="text-neutral-600 mt-1">Create and manage business cases.</p>
        </div>
        <button
          onClick={() => navigate('/cases/new')}
          className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-900"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          New Case
        </button>
      </div>

      <div className="p-6">
        <div className="bg-white border border-neutral-300 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-lg text-neutral-800">All Cases</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-neutral-700">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="py-4 px-4 text-neutral-500" colSpan={4}>
                      Loading cases...
                    </td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td className="py-4 px-4 text-red-600" colSpan={4}>
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && rows.length === 0 && (
                  <tr>
                    <td className="py-6 px-4 text-neutral-500" colSpan={4}>
                      No cases yet. Click "New Case" to add one.
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-neutral-200">
                    <td className="py-3 px-4 text-neutral-900">{r.title}</td>
                    <td className="py-3 px-4 text-neutral-600">{r.client_name || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs border border-neutral-300 rounded">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/cases/${r.id}/edit`}
                          className="px-2 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-50"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => confirmDelete(r.id, r.title)}
                          className="px-2 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete case?"
        message={`This will permanently remove "${pendingDeleteTitle}".`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}
