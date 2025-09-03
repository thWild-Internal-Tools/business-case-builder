import React, { useEffect, useMemo, useState } from 'react'
import Layout from './components/Layout'
import DashboardHeader from './components/DashboardHeader'
import MetricCard, { Metric } from './components/MetricCard'
import ChartCard from './components/ChartCard'
import RecentCases from './components/RecentCases'
import TopClientsTable, { TopClient } from './components/TopClientsTable'
import TimelineOverview, { Milestone } from './components/TimelineOverview'
import { BusinessCase, CaseRecord } from './types'
import ItemsPanel from './components/ItemsPanel'

export default function App() {
  const [timeframe, setTimeframe] = useState('Last 30 days')
  const [cases, setCases] = useState<BusinessCase[]>([])

  // Load recent cases from API, with fallback mock data
  useEffect(() => {
    fetch('/api/cases')
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        const rows = (data.data as CaseRecord[]).map((row) => ({
          id: row.id,
          title: row.title,
          client: row.client_name || '—',
          roi: '—',
          payback: '—',
          status: row.status
        })) as BusinessCase[]
        setCases(rows)
      })
      .catch(() => {
        setCases([
          { id: '1', title: 'Digital Transformation Initiative', client: 'Acme Corporation', roi: '$2.1M', payback: '24 months', status: 'Active' },
          { id: '2', title: 'Cloud Migration Strategy', client: 'TechStart Inc', roi: '$850K', payback: '18 months', status: 'Planning' },
          { id: '3', title: 'Process Optimization Project', client: 'Global Manufacturing', roi: '$1.3M', payback: '30 months', status: 'Review' }
        ])
      })
  }, [])

  const metrics: Metric[] = useMemo(
    () => [
      { title: 'Total Cases', value: '24', delta: '+12% from last month', iconClass: 'fa-solid fa-briefcase' },
      { title: 'Active Clients', value: '18', delta: '+8% from last month', iconClass: 'fa-solid fa-users' },
      { title: 'Total ROI', value: '$2.4M', delta: '+23% from last month', iconClass: 'fa-solid fa-chart-line' },
      { title: 'Avg. Case Value', value: '$125K', delta: '-3% from last month', iconClass: 'fa-solid fa-dollar-sign' }
    ],
    []
  )

  const topClients: TopClient[] = [
    { name: 'Acme Corporation', industry: 'Technology', cases: 3, roi: '$2.1M', status: 'Active', avatarSeed: 'acme' },
    { name: 'TechStart Inc', industry: 'Software', cases: 2, roi: '$850K', status: 'Active', avatarSeed: 'techstart' },
    { name: 'Global Manufacturing', industry: 'Manufacturing', cases: 4, roi: '$1.3M', status: 'Review', avatarSeed: 'global' },
    { name: 'Innovation Labs', industry: 'Research', cases: 1, roi: '$3.2M', status: 'Active', avatarSeed: 'innovation' },
    { name: 'SecureBank Corp', industry: 'Financial', cases: 2, roi: '$680K', status: 'Planning', avatarSeed: 'secure' }
  ]

  const milestones: Milestone[] = [
    {
      title: 'Phase 2 Implementation',
      context: 'Digital Transformation • Acme Corp',
      due: 'March 15, 2025',
      progress: 0.75
    },
    {
      title: 'Security Review',
      context: 'Cloud Migration • TechStart Inc',
      due: 'April 3, 2025',
      progress: 0.4
    },
    {
      title: 'Automation Pilot',
      context: 'Process Optimization • Global Manufacturing',
      due: 'April 20, 2025',
      progress: 0.2
    }
  ]

  return (
    <Layout>
      <div className="flex-1 bg-neutral-50 min-h-screen">
        <DashboardHeader timeframe={timeframe} onChangeTimeframe={setTimeframe} />

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((m) => (
              <MetricCard key={m.title} {...m} />
            ))}
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Case Performance Overview" timeframe={timeframe} onChangeTimeframe={setTimeframe}>
              <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="fa-solid fa-chart-line text-4xl text-neutral-400 mb-2"></i>
                  <p className="text-neutral-500">Case creation and completion trends</p>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Client Activity">
              <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="fa-solid fa-chart-bar text-4xl text-neutral-400 mb-2"></i>
                  <p className="text-neutral-500">Client engagement and case distribution</p>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>

        <div className="px-6 pb-6">
          <RecentCases cases={cases} />
        </div>

        <div className="px-6 pb-6">
          <TopClientsTable clients={topClients} />
        </div>

        <div className="px-6 pb-6">
          <ItemsPanel caseId={cases[0]?.id ?? null} />
        </div>

        <div className="px-6 pb-10">
          <TimelineOverview milestones={milestones} />
        </div>
      </div>
    </Layout>
  )
}
