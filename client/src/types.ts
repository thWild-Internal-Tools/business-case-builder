export type BusinessCase = {
  id: string
  title: string
  client: string
  roi: string
  payback: string
  status: 'Active' | 'Planning' | 'Review'
}

export type CaseRecord = {
  id: string
  client_id: string
  title: string
  description: string | null
  status: 'Active' | 'Planning' | 'Review'
  created_at: string
  updated_at: string
  client_name?: string
}

export type CostItem = {
  id: string
  case_id: string
  name: string
  category: string | null
  amount: string
  notes: string | null
}

export type RevenueItem = {
  id: string
  case_id: string
  name: string
  category: string | null
  amount: string
  notes: string | null
}

export type Client = {
  id: string
  name: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type BusinessCaseRecord = {
  id: string
  client_id: string
  title: string
  description: string | null
  status: 'Active' | 'Planning' | 'Review'
  created_at: string
  updated_at: string
  client_name?: string
}
