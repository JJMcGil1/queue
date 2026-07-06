import type { Item, ItemInput, ItemPatch } from '../../shared/types'

export interface QueueApi {
  list(): Promise<Item[]>
  create(input: ItemInput): Promise<Item>
  update(id: number, patch: ItemPatch): Promise<Item>
  remove(id: number): Promise<void>
}

declare global {
  interface Window {
    queue?: {
      list(): Promise<Item[]>
      create(input: ItemInput): Promise<Item>
      update(id: number, patch: ItemPatch): Promise<Item>
      delete(id: number): Promise<void>
    }
  }
}

function createBrowserFallback(): QueueApi {
  const KEY = 'queue.items'
  const read = (): Item[] => JSON.parse(localStorage.getItem(KEY) ?? '[]')
  const write = (items: Item[]): void => localStorage.setItem(KEY, JSON.stringify(items))
  return {
    async list() {
      return read()
    },
    async create(input) {
      const items = read()
      const now = new Date().toISOString()
      const item: Item = {
        id: items.reduce((m, i) => Math.max(m, i.id), 0) + 1,
        ...input,
        createdAt: now,
        updatedAt: now
      }
      write([item, ...items])
      return item
    },
    async update(id, patch) {
      const items = read()
      const idx = items.findIndex((i) => i.id === id)
      items[idx] = { ...items[idx], ...patch, updatedAt: new Date().toISOString() }
      write(items)
      return items[idx]
    },
    async remove(id) {
      write(read().filter((i) => i.id !== id))
    }
  }
}

const bridge = window.queue

export const api: QueueApi = bridge
  ? {
      list: () => bridge.list(),
      create: (input) => bridge.create(input),
      update: (id, patch) => bridge.update(id, patch),
      remove: (id) => bridge.delete(id)
    }
  : createBrowserFallback()
