import React from 'react'

export type Metric = {
  title: string
  value: string
  delta: string
  iconClass: string
}

export default function MetricCard({ title, value, delta, iconClass }: Metric) {
  return (
    <div className="bg-white rounded-lg border border-neutral-300 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600">{title}</p>
          <p className="text-3xl text-neutral-900 mt-2">{value}</p>
        </div>
        <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
          <i className={`${iconClass} text-neutral-600 text-xl`}></i>
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className="text-neutral-600 text-sm">{delta}</span>
      </div>
    </div>
  )
}

