import React, { PropsWithChildren } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="flex min-h-screen">
        <Sidebar />
        {children}
      </div>
    </div>
  )
}

