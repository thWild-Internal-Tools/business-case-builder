import React from 'react'

export type Milestone = {
  title: string
  context: string
  due: string
  progress: number // 0..1
}

type Props = {
  milestones: Milestone[]
}

export default function TimelineOverview({ milestones }: Props) {
  return (
    <div className="bg-white rounded-lg border border-neutral-300">
      <div className="px-6 py-4 border-b border-neutral-300">
        <div className="flex items-center justify-between">
          <h3 className="text-lg text-neutral-800">Case Timeline Overview</h3>
          <div className="flex items-center space-x-2">
            <select className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500">
              <option>Next 3 months</option>
              <option>Next 6 months</option>
              <option>Next 12 months</option>
            </select>
            <button className="px-4 py-2 bg-neutral-600 text-white rounded-lg text-sm hover:bg-neutral-700">
              View Calendar
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-neutral-800 mb-4">Active Case Milestones</h4>
            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-neutral-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-neutral-900">{m.title}</p>
                    <p className="text-sm text-neutral-600">{m.context}</p>
                    <p className="text-xs text-neutral-500">Due: {m.due}</p>
                    <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-neutral-600 h-2 rounded-full" style={{ width: `${Math.round(m.progress * 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{Math.round(m.progress * 100)}% Complete</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-neutral-800 mb-4">Forecast Summary</h4>
            <div className="h-52 bg-neutral-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <i className="fa-solid fa-calendar-days text-3xl text-neutral-400 mb-2"></i>
                <p className="text-neutral-500">Upcoming milestones and expected impact</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

