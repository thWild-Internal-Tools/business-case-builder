import { api, ApiItemResponse, ApiListResponse } from './api'
import type { BusinessCaseRecord } from '../types'

export async function listCases(): Promise<BusinessCaseRecord[]> {
  const res = await api<ApiListResponse<BusinessCaseRecord>>('/api/cases')
  return res.data
}

export async function getCase(id: string): Promise<BusinessCaseRecord> {
  const res = await api<ApiItemResponse<BusinessCaseRecord>>(`/api/cases/${id}`)
  return res.data
}

export async function createCase(input: {
  client_id: string
  title: string
  description?: string | null
  status?: 'Active' | 'Planning' | 'Review'
  category?: string | null
  time_basis?: 'Monthly' | 'Quarterly' | null
  duration_value?: number | null
  duration_unit?: 'months' | 'quarters' | null
  currency_code?: string | null
  tags?: string[]
}): Promise<BusinessCaseRecord> {
  const res = await api<ApiItemResponse<BusinessCaseRecord>>('/api/cases', {
    method: 'POST',
    body: JSON.stringify(input)
  })
  return res.data
}

export async function updateCase(
  id: string,
  input: Partial<{
    client_id: string
    title: string
    description: string | null
    status: 'Active' | 'Planning' | 'Review'
    category: string | null
    time_basis: 'Monthly' | 'Quarterly' | null
    duration_value: number | null
    duration_unit: 'months' | 'quarters' | null
    currency_code: string | null
    tags: string[]
  }>
): Promise<BusinessCaseRecord> {
  const res = await api<ApiItemResponse<BusinessCaseRecord>>(`/api/cases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input)
  })
  return res.data
}

export async function deleteCase(id: string): Promise<void> {
  await api<void>(`/api/cases/${id}`, { method: 'DELETE' })
}
