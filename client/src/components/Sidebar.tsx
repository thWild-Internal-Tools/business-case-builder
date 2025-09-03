import React from 'react'

export default function Sidebar() {
  return (
    <div className="w-72 bg-white border-r border-neutral-300 hidden lg:flex flex-col">
      <div className="px-6 py-4 border-b border-neutral-300">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-briefcase text-white text-sm"></i>
          </div>
          <div>
            <div className="text-neutral-900 font-semibold">Business Case Builder</div>
            <div className="text-xs text-neutral-600">Dashboard</div>
          </div>
        </div>
      </div>

      <div className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
        <a className="flex items-center px-3 py-2 rounded-lg text-neutral-900 bg-neutral-100 border border-neutral-300" href="#">
          <i className="fa-solid fa-gauge-high mr-3 text-neutral-600"></i>
          Overview
        </a>
        <a className="flex items-center px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50" href="#">
          <i className="fa-solid fa-briefcase mr-3 text-neutral-600"></i>
          Business Cases
        </a>
        <a className="flex items-center px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50" href="#">
          <i className="fa-solid fa-users mr-3 text-neutral-600"></i>
          Clients
        </a>
        <a className="flex items-center px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50" href="#">
          <i className="fa-solid fa-chart-line mr-3 text-neutral-600"></i>
          Analytics
        </a>
        <a className="flex items-center px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50" href="#">
          <i className="fa-solid fa-gear mr-3 text-neutral-600"></i>
          Settings
        </a>
      </div>

      <div className="px-6 py-4 border-t border-neutral-300">
        <div className="flex items-center space-x-3">
          <img className="w-8 h-8 rounded-full" src="https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=codex" alt="user" />
          <div className="flex-1">
            <div className="text-sm text-neutral-900">You</div>
            <div className="text-xs text-neutral-500">Product Manager</div>
          </div>
          <i className="fa-solid fa-ellipsis-vertical text-neutral-500"></i>
        </div>
      </div>
    </div>
  )
}

