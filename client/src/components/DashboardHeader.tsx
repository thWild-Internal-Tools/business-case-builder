import React from 'react'

type Props = {
  timeframe: string
  onChangeTimeframe: (v: string) => void
  onExport?: () => void
}

export default function DashboardHeader({ timeframe, onChangeTimeframe, onExport }: Props) {
  return (
    <div className="bg-white border-b border-neutral-300 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-neutral-800">Dashboard</h1>
          <p className="text-neutral-600 mt-1">Welcome back! Here's what's happening with your business cases.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => onChangeTimeframe(e.target.value)}
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          >
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
          <button
            onClick={onExport}
            className="flex items-center px-4 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50"
          >
            <i className="fa-solid fa-download mr-2"></i>
            Export
          </button>
        </div>
      </div>
    </div>
  )
}

