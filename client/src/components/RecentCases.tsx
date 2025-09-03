import React from 'react'
import { BusinessCase } from '../types'

type Props = {
  cases: BusinessCase[]
}

export default function RecentCases({ cases }: Props) {
  return (
    <div className="bg-white rounded-lg border border-neutral-300">
      <div className="px-6 py-4 border-b border-neutral-300">
        <div className="flex items-center justify-between">
          <h3 className="text-lg text-neutral-800">Recent Business Cases</h3>
          <span className="text-neutral-600 text-sm hover:text-neutral-800 cursor-pointer">View All</span>
        </div>
      </div>
      <div className="divide-y divide-neutral-200">
        {cases.map((c) => (
          <div key={c.id} className="px-6 py-4 hover:bg-neutral-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-briefcase text-neutral-600"></i>
                </div>
                <div>
                  <h4 className="text-neutral-900">{c.title}</h4>
                  <p className="text-sm text-neutral-600">{c.client}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-neutral-900">{c.roi} ROI</p>
                <p className="text-sm text-neutral-600">{c.payback} payback</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

