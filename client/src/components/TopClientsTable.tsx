import React from 'react'

export type TopClient = {
  name: string
  industry: string
  cases: number
  roi: string
  status: 'Active' | 'Planning' | 'Review'
  avatarSeed: string
}

type Props = { clients: TopClient[] }

export default function TopClientsTable({ clients }: Props) {
  return (
    <div className="bg-white rounded-lg border border-neutral-300">
      <div className="px-6 py-4 border-b border-neutral-300">
        <div className="flex items-center justify-between">
          <h3 className="text-lg text-neutral-800">Top Clients</h3>
          <span className="text-neutral-600 text-sm hover:text-neutral-800 cursor-pointer">View All</span>
        </div>
      </div>
      <div className="p-6 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-sm text-neutral-600">
              <th className="py-2 px-4">Client</th>
              <th className="py-2 px-4">Industry</th>
              <th className="py-2 px-4">Cases</th>
              <th className="py-2 px-4">Total ROI</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.name} className="hover:bg-neutral-50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=${encodeURIComponent(c.avatarSeed)}`} alt={c.name} className="w-8 h-8 rounded-full" />
                    <span className="text-neutral-900">{c.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-neutral-600">{c.industry}</td>
                <td className="py-3 px-4 text-neutral-900">{c.cases}</td>
                <td className="py-3 px-4 text-neutral-900">{c.roi}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-800 rounded-full">{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

