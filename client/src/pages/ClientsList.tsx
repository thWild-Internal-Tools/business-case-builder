import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listClients, deleteClient } from '../services/clients'
import type { Client } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    listClients()
      .then(setClients)
      .catch((e) => setError(e.message || 'Failed to load clients'))
      .finally(() => setLoading(false))
  }, [])

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [pendingDeleteName, setPendingDeleteName] = useState<string>('')

  function confirmDelete(id: string, name: string) {
    setPendingDeleteId(id)
    setPendingDeleteName(name)
  }

  async function handleDeleteConfirmed() {
    if (!pendingDeleteId) return
    await deleteClient(pendingDeleteId)
    setClients((s) => s.filter((c) => c.id !== pendingDeleteId))
    setPendingDeleteId(null)
  }

  return (
    <div className="flex-1 bg-neutral-50 min-h-screen">
      <div className="bg-white border-b border-neutral-300 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-neutral-800">Client Management</h1>
          <p className="text-neutral-600 mt-1">Create, edit, and manage your clients.</p>
        </div>
        <button
          onClick={() => navigate('/clients/new')}
          className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-900"
        >
          <i className="fa-solid fa-user-plus mr-2"></i>
          New Client
        </button>
      </div>

      <div className="p-6">
        <div className="bg-white border border-neutral-300 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-lg text-neutral-800">All Clients</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-neutral-700">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="py-4 px-4 text-neutral-500" colSpan={3}>
                      Loading clients...
                    </td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td className="py-4 px-4 text-red-600" colSpan={3}>
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && clients.length === 0 && (
                  <tr>
                    <td className="py-6 px-4 text-neutral-500" colSpan={3}>
                      No clients yet. Click "New Client" to add one.
                    </td>
                  </tr>
                )}
                {clients.map((c) => (
                  <tr key={c.id} className="border-t border-neutral-200">
                    <td className="py-3 px-4 text-neutral-900">{c.name}</td>
                    <td className="py-3 px-4 text-neutral-600">{c.notes || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/clients/${c.id}/edit`}
                          className="px-2 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-50"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => confirmDelete(c.id, c.name)}
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
        title="Delete client?"
        message={`This will permanently remove ${pendingDeleteName}.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}
