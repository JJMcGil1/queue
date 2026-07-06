import { contextBridge, ipcRenderer } from 'electron'
import type { ItemInput, ItemPatch } from '../shared/types'

contextBridge.exposeInMainWorld('queue', {
  list: () => ipcRenderer.invoke('items:list'),
  create: (input: ItemInput) => ipcRenderer.invoke('items:create', input),
  update: (id: number, patch: ItemPatch) => ipcRenderer.invoke('items:update', id, patch),
  delete: (id: number) => ipcRenderer.invoke('items:delete', id)
})
