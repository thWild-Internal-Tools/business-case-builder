import React, { useEffect, useState } from 'react'
import { CostItem, RevenueItem } from '../types'

type Props = {
  caseId: string | null
}

export default function ItemsPanel({ caseId }: Props) {
  const [costItems, setCostItems] = useState<CostItem[]>([])
  const [revenueItems, setRevenueItems] = useState<RevenueItem[]>([])
  const [newCost, setNewCost] = useState<{ name: string; amount: string }>({ name: '', amount: '' })
  const [newRevenue, setNewRevenue] = useState<{ name: string; amount: string }>({ name: '', amount: '' })

  useEffect(() => {
    if (!caseId) {
      setCostItems([])
      setRevenueItems([])
      return
    }
    fetch(`/api/cost-items?case_id=${caseId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => setCostItems(data.data as CostItem[]))
      .catch(() => setCostItems([]))

    fetch(`/api/revenue-items?case_id=${caseId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => setRevenueItems(data.data as RevenueItem[]))
      .catch(() => setRevenueItems([]))
  }, [caseId])

  const addCost = async () => {
    if (!caseId || !newCost.name || !newCost.amount) return
    const r = await fetch('/api/cost-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: caseId, name: newCost.name, amount: Number(newCost.amount) })
    })
    if (r.ok) {
      const { data } = await r.json()
      setCostItems((prev) => [data as CostItem, ...prev])
      setNewCost({ name: '', amount: '' })
    }
  }

  const addRevenue = async () => {
    if (!caseId || !newRevenue.name || !newRevenue.amount) return
    const r = await fetch('/api/revenue-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: caseId, name: newRevenue.name, amount: Number(newRevenue.amount) })
    })
    if (r.ok) {
      const { data } = await r.json()
      setRevenueItems((prev) => [data as RevenueItem, ...prev])
      setNewRevenue({ name: '', amount: '' })
    }
  }

  const removeCost = async (id: string) => {
    const r = await fetch(`/api/cost-items/${id}`, { method: 'DELETE' })
    if (r.status === 204) setCostItems((prev) => prev.filter((i) => i.id !== id))
  }

  const removeRevenue = async (id: string) => {
    const r = await fetch(`/api/revenue-items/${id}`, { method: 'DELETE' })
    if (r.status === 204) setRevenueItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-neutral-900">Cost Items</h3>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 border border-neutral-300 rounded px-2 py-1 text-sm"
            placeholder="Name"
            value={newCost.name}
            onChange={(e) => setNewCost((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            className="w-28 border border-neutral-300 rounded px-2 py-1 text-sm"
            placeholder="Amount"
            type="number"
            value={newCost.amount}
            onChange={(e) => setNewCost((s) => ({ ...s, amount: e.target.value }))}
          />
          <button className="px-3 py-1 bg-neutral-900 text-white rounded text-sm" onClick={addCost} disabled={!caseId}>
            Add
          </button>
        </div>
        <ul className="divide-y divide-neutral-200">
          {costItems.map((i) => (
            <li key={i.id} className="py-2 flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-900">{i.name}</p>
                <p className="text-xs text-neutral-500">${Number(i.amount).toLocaleString()}</p>
              </div>
              <button className="text-xs text-red-600" onClick={() => removeCost(i.id)}>
                Delete
              </button>
            </li>
          ))}
          {costItems.length === 0 && <li className="py-2 text-sm text-neutral-500">No items</li>}
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-neutral-900">Revenue Items</h3>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 border border-neutral-300 rounded px-2 py-1 text-sm"
            placeholder="Name"
            value={newRevenue.name}
            onChange={(e) => setNewRevenue((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            className="w-28 border border-neutral-300 rounded px-2 py-1 text-sm"
            placeholder="Amount"
            type="number"
            value={newRevenue.amount}
            onChange={(e) => setNewRevenue((s) => ({ ...s, amount: e.target.value }))}
          />
        <button className="px-3 py-1 bg-neutral-900 text-white rounded text-sm" onClick={addRevenue} disabled={!caseId}>
            Add
          </button>
        </div>
        <ul className="divide-y divide-neutral-200">
          {revenueItems.map((i) => (
            <li key={i.id} className="py-2 flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-900">{i.name}</p>
                <p className="text-xs text-neutral-500">${Number(i.amount).toLocaleString()}</p>
              </div>
              <button className="text-xs text-red-600" onClick={() => removeRevenue(i.id)}>
                Delete
              </button>
            </li>
          ))}
          {revenueItems.length === 0 && <li className="py-2 text-sm text-neutral-500">No items</li>}
        </ul>
      </div>
    </div>
  )
}

