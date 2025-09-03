import { randomUUID } from 'crypto';

export const mem = {
  clients: [] as any[],
  cases: [] as any[],
  cost_items: [] as any[],
  revenue_items: [] as any[]
};

export function newId(): string {
  return randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

