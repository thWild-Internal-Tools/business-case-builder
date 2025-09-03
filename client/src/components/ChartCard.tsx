import React, { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  title: string
  timeframe?: string
  onChangeTimeframe?: (v: string) => void
}>

export default function ChartCard({ title, children, timeframe, onChangeTimeframe }: Props) {
  return (
    <div className="bg-white rounded-lg border border-neutral-300 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg text-neutral-800">{title}</h3>
        {onChangeTimeframe ? (
          <select
            value={timeframe}
            onChange={(e) => onChangeTimeframe(e.target.value)}
            className="border border-neutral-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          >
            <option>Last 6 months</option>
            <option>Last 12 months</option>
            <option>All time</option>
          </select>
        ) : (
          <button className="text-neutral-600 text-sm hover:text-neutral-800">View Details</button>
        )}
      </div>
      {children}
    </div>
  )}

