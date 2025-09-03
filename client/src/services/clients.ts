import { api, ApiItemResponse, ApiListResponse } from './api'
import type { Client } from '../types'

export async function listClients(): Promise<Client[]> {
  const res = await api<ApiListResponse<Client>>('/api/clients')
  return res.data
}

export async function getClient(id: string): Promise<Client> {
  const res = await api<ApiItemResponse<Client>>(`/api/clients/${id}`)
  return res.data
}

export async function createClient(input: { name: string; notes?: string | null }): Promise<Client> {
  const res = await api<ApiItemResponse<Client>>('/api/clients', {
    method: 'POST',
    body: JSON.stringify(input)
  })
  return res.data
}

export async function updateClient(id: string, input: Partial<{ name: string; notes: string | null }>): Promise<Client> {
  const res = await api<ApiItemResponse<Client>>(`/api/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input)
  })
  return res.data
}

export async function deleteClient(id: string): Promise<void> {
  await api<void>(`/api/clients/${id}`, { method: 'DELETE' })
}

